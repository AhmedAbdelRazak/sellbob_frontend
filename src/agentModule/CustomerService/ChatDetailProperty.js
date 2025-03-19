/** @format */
import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useLocation, useHistory } from "react-router-dom"; // ADDED
import { isAuthenticated } from "../../auth";
import { updateSupportCase } from "../apiAgent";
import { Input, Select, Button as AntdButton, Upload, Form } from "antd";
import socket from "../../socket";
import EmojiPicker from "emoji-picker-react";
import { SmileOutlined, UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const ChatDetailProperty = ({
	chat,
	isHistory,
	fetchChats,
	chosenLanguage,
}) => {
	// 1) Get user + token from isAuthenticated
	const { user, token } = isAuthenticated();

	// 2) We'll store agentId from ?agent=..., or localStorage, or fallback to user._id
	const location = useLocation();
	const history = useHistory();
	const [agentId, setAgentId] = useState("");

	// We'll just pluck out stable references for userId / email
	const userId = user?._id;
	const userEmail = user?.email;
	const userRole = user?.role;

	// 3) On mount or userId changes, ensure ?agent is correct
	useEffect(() => {
		if (!userId) return; // No user => do nothing

		const searchParams = new URLSearchParams(location.search);
		const existingAgent = searchParams.get("agent");

		const storedAgentId = localStorage.getItem("agentId")?.trim() || "";
		const finalAgentId = storedAgentId !== "" ? storedAgentId : userId;

		// Only replace if different => avoids infinite loop
		if (existingAgent !== finalAgentId) {
			searchParams.set("agent", finalAgentId);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
		}

		setAgentId(finalAgentId);
	}, [userId, location, history]);

	// 4) Local states
	const [messages, setMessages] = useState(chat.conversation || []);
	const [newMessage, setNewMessage] = useState("");
	const [caseStatus, setCaseStatus] = useState(chat.caseStatus);

	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [typingStatus, setTypingStatus] = useState("");

	// For the user's "display name" in chat
	// fallback: chat.supporterName || user.name
	const [displayName, setDisplayName] = useState(
		chat.supporterName || user?.name || "Agent"
	);

	const messagesEndRef = useRef(null);

	// 5) Join the socket room, handle inbound events
	useEffect(() => {
		socket.emit("joinRoom", { caseId: chat._id });

		const handleReceiveMessage = (updatedCase) => {
			// If the same chat, update messages
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

	// Auto-scroll to bottom whenever messages OR typing status changes
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, typingStatus]); // <-- ADDED typingStatus here

	/* --------------------------------------
	 * SEND MESSAGE
	 * -------------------------------------- */
	const handleSendMessage = async () => {
		const msg = newMessage.trim();
		if (!msg) return;

		// Build the new message
		const messageData = {
			caseId: chat._id,
			messageBy: {
				customerName: displayName,
				customerEmail: userEmail,
				userId: agentId, // ADDED: agentId from param (or fallback)
			},
			message: msg,
			date: new Date(),
			seenByAgent: true, // because we're sending
			seenByAdmin: true,
		};

		// 1) Locally add it
		setMessages((prev) => [...prev, messageData]);

		// 2) Update DB via REST
		try {
			await updateSupportCase(chat._id, { conversation: messageData }, token);
			// 3) Real-time broadcast
			socket.emit("sendMessage", messageData);

			setNewMessage("");
			socket.emit("stopTyping", { caseId: chat._id, user: displayName });

			if (typeof fetchChats === "function") {
				fetchChats();
			}
		} catch (err) {
			console.error("Error sending agent message:", err);
		}
	};

	const handleInputChange = (e) => {
		setNewMessage(e.target.value);
		socket.emit("typing", { caseId: chat._id, user: displayName });
	};

	const handleInputBlur = () => {
		socket.emit("stopTyping", { caseId: chat._id, user: displayName });
	};

	/* --------------------------------------
	 * CHANGE STATUS (open/closed)
	 * -------------------------------------- */
	const handleChangeStatus = async (value) => {
		try {
			await updateSupportCase(chat._id, { caseStatus: value }, token);
			setCaseStatus(value);

			if (value === "closed") {
				socket.emit("closeCase", {
					case: { _id: chat._id },
					closedBy: user?.name || "Agent",
				});
			}
		} catch (err) {
			console.error("Error updating case status:", err);
		}
	};

	/* --------------------------------------
	 * DISPLAY NAME
	 * Only editable if user && user.role === 1000
	 * -------------------------------------- */
	const handleDisplayNameChange = (e) => {
		setDisplayName(e.target.value);
	};

	/* --------------------------------------
	 * EMOJI PICKER
	 * -------------------------------------- */
	const onEmojiClick = (emojiObj) => {
		setNewMessage((prev) => prev + emojiObj.emoji);
		setShowEmojiPicker(false);
	};

	/* --------------------------------------
	 * FILE ATTACHMENTS (placeholder logic)
	 * -------------------------------------- */
	const handleFileChange = ({ fileList }) => {
		setFileList(fileList);
		// If you want to do an actual upload, handle it here
	};

	/* --------------------------------------
	 * UTILS
	 * -------------------------------------- */
	const isMine = (msg) => {
		// Compare the message's userId to our agentId
		return msg.messageBy.userId === agentId;
	};

	const propertyName = chat.propertyId?.propertyName;

	return (
		<ChatDetailWrapper>
			<h3 style={{ textTransform: "capitalize" }}>
				{chosenLanguage === "Arabic" ? "محادثة مع" : "Chat with"}{" "}
				<span style={{ fontWeight: "bold" }}>
					{propertyName ||
						chat.conversation[0]?.messageBy?.customerName ||
						"Unknown"}
				</span>
			</h3>
			<p>
				<strong>
					{chosenLanguage === "Arabic" ? "حول الاستفسار:" : "Inquiry About:"}
				</strong>{" "}
				{chat.conversation[0]?.inquiryAbout}
			</p>
			<p>
				<strong>{chosenLanguage === "Arabic" ? "تفاصيل:" : "Details:"}</strong>{" "}
				{chat.conversation[0]?.inquiryDetails}
			</p>

			{/* If not in history mode, show status & display name */}
			{!isHistory && (
				<>
					<StatusSelect value={caseStatus} onChange={handleChangeStatus}>
						<Option value='open'>
							{chosenLanguage === "Arabic" ? "مفتوح" : "Open"}
						</Option>
						<Option value='closed'>
							{chosenLanguage === "Arabic" ? "مغلق" : "Closed"}
						</Option>
					</StatusSelect>

					{caseStatus === "open" && (
						<Form layout='vertical'>
							<Form.Item label='Display Name'>
								<Input
									value={displayName}
									onChange={handleDisplayNameChange}
									placeholder='Enter your display name'
									disabled={userRole !== 1000} // Only editable if super-admin
								/>
							</Form.Item>
						</Form>
					)}
				</>
			)}

			{/* MESSAGES LIST */}
			<ChatMessages>
				{messages.map((msg, idx) => (
					<MessageBubble key={idx} isMine={isMine(msg)}>
						<strong>{msg.messageBy.customerName}:</strong> {msg.message}
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

			{/* IF NOT HISTORY & still open => show message input */}
			{!isHistory && caseStatus === "open" && (
				<ChatInputContainer>
					<Input
						placeholder={
							chosenLanguage === "Arabic"
								? "اكتب رسالتك..."
								: "Type your message..."
						}
						value={newMessage}
						onChange={handleInputChange}
						onBlur={handleInputBlur}
						onPressEnter={handleSendMessage}
					/>
					<SmileOutlined onClick={() => setShowEmojiPicker(!showEmojiPicker)} />

					{showEmojiPicker && (
						<EmojiPickerWrapper>
							<EmojiPicker onEmojiClick={onEmojiClick} />
						</EmojiPickerWrapper>
					)}

					<Upload
						fileList={fileList}
						onChange={handleFileChange}
						beforeUpload={() => false}
					>
						<AntdButton icon={<UploadOutlined />} />
					</Upload>

					<SendButton type='primary' onClick={handleSendMessage}>
						{chosenLanguage === "Arabic" ? "إرسال" : "Send"}
					</SendButton>
				</ChatInputContainer>
			)}
		</ChatDetailWrapper>
	);
};

export default ChatDetailProperty;

/* ------------- STYLED COMPONENTS ------------- */

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
	button {
		width: auto;
	}
`;

const EmojiPickerWrapper = styled.div`
	position: absolute;
	bottom: 60px;
	right: 20px;
	z-index: 1002;
`;

const SendButton = styled(AntdButton)`
	background-color: var(--button-bg-primary);
	color: var(--button-font-color);
	border: none;
	transition: var(--main-transition);

	&:hover {
		background-color: var(--button-bg-primary-light);
		color: var(--button-font-color);
	}
`;
