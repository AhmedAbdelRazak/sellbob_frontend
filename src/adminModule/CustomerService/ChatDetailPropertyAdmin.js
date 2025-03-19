/** @format */
// ChatDetailPropertyAdmin.js
import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { isAuthenticated } from "../../auth";
import {
	adminUpdateSupportCase,
	adminMarkAllMessagesAsSeen,
} from "../apiAdmin";
import { Input, Select, Button, Upload, Form } from "antd";
import socket from "../../socket";
import EmojiPicker from "emoji-picker-react";
import { SmileOutlined, UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const ChatDetailPropertyAdmin = ({ chat, isHistory, fetchChats }) => {
	// Auth info
	const { user, token } = isAuthenticated();

	// local states
	const [messages, setMessages] = useState(chat.conversation || []);
	const [newMessage, setNewMessage] = useState("");
	const [caseStatus, setCaseStatus] = useState(chat.caseStatus);
	const [displayName, setDisplayName] = useState(
		chat.supporterName || user?.name || "Admin"
	);

	// UI extras
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [typingStatus, setTypingStatus] = useState("");

	const messagesEndRef = useRef(null);

	// 1) Join the Socket room for real-time
	useEffect(() => {
		socket.emit("joinRoom", { caseId: chat._id });

		const handleReceiveMessage = (updatedCase) => {
			if (updatedCase._id === chat._id) {
				setMessages(updatedCase.conversation);
			}
		};

		const handleTyping = (data) => {
			if (data.caseId === chat._id && data.user !== displayName) {
				setTypingStatus(`${data.user} is typing`);
			}
		};

		const handleStopTyping = (data) => {
			if (data.caseId === chat._id && data.user !== displayName) {
				setTypingStatus("");
			}
		};

		socket.on("receiveMessage", handleReceiveMessage);
		socket.on("typing", handleTyping);
		socket.on("stopTyping", handleStopTyping);

		return () => {
			socket.off("receiveMessage", handleReceiveMessage);
			socket.off("typing", handleTyping);
			socket.off("stopTyping", handleStopTyping);
			socket.emit("leaveRoom", { caseId: chat._id });
		};
	}, [chat._id, displayName]);

	// 2) Scroll to bottom whenever messages or typing change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, typingStatus]);

	/* --------------------------
	 *  Send Message as Admin
	 * -------------------------- */
	const handleSendMessage = async () => {
		const msg = newMessage.trim();
		if (!msg) return;

		const messageData = {
			caseId: chat._id,
			messageBy: {
				customerName: displayName,
				customerEmail: user?.email,
				userId: user?._id,
			},
			message: msg,
			date: new Date(),
			seenByAdmin: true,
			seenByAgent: true,
			seenByClient: false,
		};

		// 1) Locally add
		setMessages((prev) => [...prev, messageData]);

		// 2) Update DB
		try {
			await adminUpdateSupportCase(chat._id, token, {
				conversation: messageData,
			});
			// 3) Socket
			socket.emit("sendMessage", messageData);
			setNewMessage("");
			socket.emit("stopTyping", { caseId: chat._id, user: displayName });
			// 4) Optionally re-fetch
			if (typeof fetchChats === "function") {
				fetchChats();
			}
		} catch (err) {
			console.error("Error sending admin message:", err);
		}
	};

	const handleInputChange = (e) => {
		setNewMessage(e.target.value);
		socket.emit("typing", { caseId: chat._id, user: displayName });
	};

	const handleStopTyping = () => {
		socket.emit("stopTyping", { caseId: chat._id, user: displayName });
	};

	// 4) Change case status
	const handleChangeStatus = async (val) => {
		try {
			await adminUpdateSupportCase(chat._id, token, { caseStatus: val });
			setCaseStatus(val);
			if (val === "closed") {
				socket.emit("closeCase", {
					case: { ...chat, caseStatus: "closed" },
					closedBy: displayName,
				});
			}
			if (typeof fetchChats === "function") {
				fetchChats();
			}
		} catch (err) {
			console.error("Error updating case status (admin):", err);
		}
	};

	// 5) Mark as seen
	const markAllAsSeen = async () => {
		try {
			await adminMarkAllMessagesAsSeen(chat._id, token, user?._id);
			// Locally update all messages to seenByAdmin: true
			setMessages((prev) => prev.map((m) => ({ ...m, seenByAdmin: true })));
		} catch (err) {
			console.error("Error marking all as seen by admin:", err);
		}
	};

	// 6) File attachments
	const handleFileChange = ({ fileList }) => {
		setFileList(fileList);
	};

	// 7) Display name changes (rare for admin)
	const handleDisplayNameChange = (e) => {
		setDisplayName(e.target.value);
	};

	// 8) Utility
	const isMine = (msg) => msg.messageBy?.userId === user?._id;

	// 9) Render
	return (
		<ChatDetailWrapper>
			<h3>
				Chat with:{" "}
				<span style={{ fontWeight: "bold" }}>
					{chat.displayName1 || "Unknown"}
				</span>
			</h3>
			<p>
				<strong>Inquiry About:</strong>{" "}
				{chat.conversation[0]?.inquiryAbout || "N/A"}
			</p>
			<p>
				<strong>Details:</strong>{" "}
				{chat.conversation[0]?.inquiryDetails || "N/A"}
			</p>

			{!isHistory && (
				<>
					<StatusSelect value={caseStatus} onChange={handleChangeStatus}>
						<Option value='open'>Open</Option>
						<Option value='closed'>Closed</Option>
					</StatusSelect>
					{caseStatus === "open" && (
						<Form layout='vertical'>
							<Form.Item label='Your Display Name (Admin)'>
								<Input
									value={displayName}
									onChange={handleDisplayNameChange}
									placeholder='Enter your display name'
								/>
							</Form.Item>
							<Button onClick={markAllAsSeen}>Mark All as Seen</Button>
						</Form>
					)}
				</>
			)}

			<ChatMessages>
				{messages.map((msg, idx) => (
					<MessageBubble key={idx} isMine={isMine(msg)}>
						<strong>{msg.messageBy?.customerName}:</strong> {msg.message}
						<div>
							<small>{new Date(msg.date).toLocaleString()}</small>
						</div>
					</MessageBubble>
				))}
				{typingStatus && (
					<TypingIndicator>
						<span className='typing-text'>{typingStatus}</span>
						<span className='dot'></span>
						<span className='dot'></span>
						<span className='dot'></span>
					</TypingIndicator>
				)}
				<div ref={messagesEndRef} />
			</ChatMessages>

			{!isHistory && caseStatus === "open" && (
				<ChatInputContainer>
					<Input
						placeholder='Type your message...'
						value={newMessage}
						onChange={handleInputChange}
						onBlur={handleStopTyping}
						onPressEnter={handleSendMessage}
					/>
					<SmileOutlined onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
					{showEmojiPicker && (
						<EmojiPickerWrapper>
							<EmojiPicker
								onEmojiClick={(emojiObj) => {
									setNewMessage((prev) => prev + emojiObj.emoji);
									setShowEmojiPicker(false);
								}}
							/>
						</EmojiPickerWrapper>
					)}
					<Upload
						fileList={fileList}
						onChange={handleFileChange}
						beforeUpload={() => false}
					>
						<Button icon={<UploadOutlined />} />
					</Upload>
					<SendButton type='primary' onClick={handleSendMessage}>
						Send
					</SendButton>
				</ChatInputContainer>
			)}
		</ChatDetailWrapper>
	);
};

export default ChatDetailPropertyAdmin;

/* ----------------- STYLED COMPONENTS ----------------- */

const ChatDetailWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 800px;
	padding: 20px;
	background-color: var(--background-light);
	border-radius: 8px;
	box-shadow: var(--box-shadow-dark);
`;

const ChatMessages = styled.div`
	flex: 1;
	overflow-y: auto;
	margin-bottom: 20px;
	position: relative;
`;

const typingBounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
`;

const TypingIndicator = styled.div`
	display: flex;
	align-items: center;
	margin-top: 5px;
	.typing-text {
		margin-right: 8px;
		font-style: italic;
		color: #666;
	}
	.dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background-color: #666;
		margin: 0 2px;
		animation: ${typingBounce} 1s infinite ease-in-out;
	}
	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}
	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}
`;

const MessageBubble = styled.div`
	margin-bottom: 10px;
	padding: 10px;
	border-radius: 8px;
	background-color: ${(props) => (props.isMine ? "#d2f8d2" : "#f5f5f5")};
	border: 1px solid #ccc;

	strong {
		display: block;
		margin-bottom: 4px;
	}
	small {
		display: block;
		margin-top: 4px;
		font-size: 0.75rem;
		color: #888;
	}
`;

const StatusSelect = styled(Select)`
	width: 150px;
	margin-bottom: 20px;
`;

const ChatInputContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 5px;
	input {
		flex-grow: 1;
	}
`;

const EmojiPickerWrapper = styled.div`
	position: absolute;
	bottom: 60px;
	right: 20px;
	z-index: 1002;
`;

const SendButton = styled(Button)`
	background-color: var(--button-bg-primary);
	color: var(--button-font-color);
	border: none;
	transition: var(--main-transition);

	&:hover {
		background-color: var(--button-bg-primary-light);
		color: var(--button-font-color);
	}
`;
