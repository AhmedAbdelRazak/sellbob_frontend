/** @format */
// ChatWindow.js (Client side)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Input, Select, Form, Upload, message } from "antd";
import {
	createNewSupportCase,
	getSupportCaseById,
	updateSupportCase,
	updateSeenByCustomer,
	gettingActivePropertyList,
} from "../apiCore";
import styled, { keyframes } from "styled-components";
import socket from "../socket";
import EmojiPicker from "emoji-picker-react";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
import StarRatings from "react-star-ratings";
import { isAuthenticated } from "../auth";
import { useRouteMatch } from "react-router-dom"; // <-- import route matching

const { Option } = Select;

// Example array of inquiry types
const INQUIRY_TYPES = [
	{ value: "Talk with Platform Admin", label: "Talk with Platform Admin" },
	{ value: "Talk with Property Agent", label: "Talk with Property Agent" },
	{ value: "others", label: "Others" },
	{ value: "reservation", label: "Reservation Inquiry" }, // if needed
];

const ChatWindow = ({ closeChatWindow, chosenLanguage, propertyDetails }) => {
	// For route matching: Are we on /single-property/...?
	const matchSingleProperty = useRouteMatch(
		"/single-property/:state/:slug/:propertyId"
	);

	// Basic states
	const [activeProperties, setActiveProperties] = useState([]);
	const [propertyId, setPropertyId] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [inquiryAbout, setInquiryAbout] = useState("");
	const [otherInquiry, setOtherInquiry] = useState("");
	const [reservationNumber, setReservationNumber] = useState("");
	const [caseId, setCaseId] = useState("");
	const [submitted, setSubmitted] = useState(false);

	// Chat states
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [typingStatus, setTypingStatus] = useState("");

	// Rating
	const [isRatingVisible, setIsRatingVisible] = useState(false);
	const [rating, setRating] = useState(0);

	const messagesEndRef = useRef(null);

	/* ------------------------------------------------------------------
	 * 1) Auto-fill name/email/phone + property details ONCE if relevant
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		// Grab user data from localStorage if any
		const userFromLocal = JSON.parse(localStorage.getItem("user")) || {};

		// Also check if user isAuthenticated
		const authResponse = isAuthenticated();
		const userFromAuth = authResponse ? authResponse.user : null;

		// Figure out the best name to use
		const localName = userFromLocal?.name || userFromAuth?.name || "";
		// Figure out the best email or phone
		const localEmailOrPhone =
			userFromLocal?.email ||
			userFromLocal?.phone ||
			userFromAuth?.email ||
			userFromAuth?.phone ||
			"";

		// Pre-populate if we have them
		if (localName) setCustomerName(localName);
		if (localEmailOrPhone) setCustomerEmail(localEmailOrPhone);

		// Only if we are on a single-property route && propertyDetails is present
		if (matchSingleProperty && propertyDetails?._id) {
			setPropertyId(propertyDetails._id);
			setInquiryAbout("Talk with Property Agent");
		}
	}, [matchSingleProperty, propertyDetails]);

	/* ------------------------------------------------------------------
	 * 2) If there's an ongoing chat in localStorage, restore it
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		const savedChat = JSON.parse(localStorage.getItem("currentChat")) || null;
		if (savedChat && savedChat.caseId) {
			setCaseId(savedChat.caseId);
			setCustomerName(savedChat.customerName || "");
			setCustomerEmail(savedChat.customerEmail || "");
			setInquiryAbout(savedChat.inquiryAbout || "");
			setOtherInquiry(savedChat.otherInquiry || "");
			setReservationNumber(savedChat.reservationNumber || "");
			setPropertyId(savedChat.propertyId || "");
			setSubmitted(savedChat.submitted || false);
			setMessages(savedChat.messages || []);
			fetchSupportCase(savedChat.caseId);
		}
	}, []);

	/* ------------------------------------------------------------------
	 * 3) Persist chat to localStorage whenever relevant fields change
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		if (caseId) {
			const saveChat = {
				caseId,
				customerName,
				customerEmail,
				inquiryAbout,
				otherInquiry,
				reservationNumber,
				propertyId,
				submitted,
				messages,
			};
			localStorage.setItem("currentChat", JSON.stringify(saveChat));
			markMessagesAsSeen(caseId);
		}
	}, [
		caseId,
		customerName,
		customerEmail,
		inquiryAbout,
		otherInquiry,
		reservationNumber,
		propertyId,
		messages,
		submitted,
	]);

	/* ------------------------------------------------------------------
	 * 4) Fetch active properties on mount
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		const fetchProperties = async () => {
			try {
				const props = await gettingActivePropertyList();
				setActiveProperties(props);
			} catch (error) {
				console.error("Error fetching properties:", error);
			}
		};
		fetchProperties();
	}, []);

	/* ------------------------------------------------------------------
	 * 5) Socket events: new messages, closeCase, typing, messageDeleted
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		const handleReceiveMessage = (updatedCaseOrMessage) => {
			// If the server is emitting the ENTIRE updatedCase:
			if (updatedCaseOrMessage._id && updatedCaseOrMessage.conversation) {
				if (updatedCaseOrMessage._id === caseId) {
					setMessages(updatedCaseOrMessage.conversation);
					markMessagesAsSeen(caseId);
				}
			}
		};

		const handleCloseCase = (result) => {
			if (result?.case?._id === caseId) {
				setIsRatingVisible(true);
			}
		};

		const handleTyping = (info) => {
			if (info.caseId === caseId && info.user !== customerName) {
				setTypingStatus(`${info.user} is typing`);
			}
		};

		const handleStopTyping = (info) => {
			if (info.caseId === caseId && info.user !== customerName) {
				setTypingStatus("");
			}
		};

		const handleMessageDeleted = (data) => {
			if (data.caseId === caseId) {
				setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
			}
		};

		socket.on("receiveMessage", handleReceiveMessage);
		socket.on("closeCase", handleCloseCase);
		socket.on("typing", handleTyping);
		socket.on("stopTyping", handleStopTyping);
		socket.on("messageDeleted", handleMessageDeleted);

		return () => {
			socket.off("receiveMessage", handleReceiveMessage);
			socket.off("closeCase", handleCloseCase);
			socket.off("typing", handleTyping);
			socket.off("stopTyping", handleStopTyping);
			socket.off("messageDeleted", handleMessageDeleted);
		};
	}, [caseId, customerName]);

	/* ------------------------------------------------------------------
	 * 6) Once we have a caseId, join the Socket.IO room
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		if (caseId) {
			socket.emit("joinRoom", { caseId });
		}
		return () => {
			if (caseId) {
				socket.emit("leaveRoom", { caseId });
			}
		};
	}, [caseId]);

	/* ------------------------------------------------------------------
	 * 7) Mark messages as seen
	 * ------------------------------------------------------------------ */
	const markMessagesAsSeen = async (id) => {
		try {
			await updateSeenByCustomer(id);
		} catch (err) {
			console.error("Error marking messages as seen:", err);
		}
	};

	/* ------------------------------------------------------------------
	 * 8) Scroll to bottom whenever messages OR typing status changes
	 * ------------------------------------------------------------------ */
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, typingStatus]);

	/* ------------------------------------------------------------------
	 * 9) Fetch a case from DB
	 * ------------------------------------------------------------------ */
	const fetchSupportCase = async (id) => {
		try {
			const supportCase = await getSupportCaseById(id);
			if (supportCase?.conversation) {
				setMessages(supportCase.conversation);
			}
		} catch (err) {
			console.error("Error fetching support case:", err);
		}
	};

	/* ==================================================================
	 * CREATE A NEW SUPPORT CASE
	 * ================================================================== */
	const handleSubmit = async () => {
		if (!customerName.trim() || !customerEmail.trim()) {
			message.error("Please fill in your name and email/phone correctly.");
			return;
		}

		const phoneRegex = /^[0-9]{10,15}$/;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		// Must match either phone or email pattern
		if (!emailRegex.test(customerEmail) && !phoneRegex.test(customerEmail)) {
			message.error("Please enter a valid email address or phone number.");
			return;
		}

		let inquiryDetails = otherInquiry || "";
		if (inquiryAbout === "reservation") {
			inquiryDetails = reservationNumber;
		}

		const payload = {
			customerName,
			customerEmail,
			displayName1: customerName,
			displayName2: "Platform Support",
			role: 0, // client role
			propertyId: propertyId || null,
			inquiryAbout,
			inquiryDetails: inquiryDetails || "General Inquiry",
			supporterId: "606060606060606060606060",
			ownerId: "606060606060606060606060",
		};

		try {
			const res = await createNewSupportCase(payload);
			setCaseId(res._id);
			setSubmitted(true);

			// Immediately show any conversation from DB or a system message
			if (res?.conversation) {
				setMessages(res.conversation);
			} else {
				setMessages((prev) => [
					...prev,
					{
						messageBy: { customerName: "System" },
						message: "A representative will be with you in 3-5 minutes.",
						date: new Date(),
					},
				]);
			}
		} catch (err) {
			console.error("Error creating support case:", err);
		}
	};

	/* ==================================================================
	 * SEND MESSAGE
	 * ================================================================== */
	const handleSendMessage = async () => {
		if (!newMessage.trim()) return;

		const msgData = {
			caseId,
			messageBy: {
				customerName,
				customerEmail,
			},
			message: newMessage,
			date: new Date(),
		};

		// 1) Locally append
		setMessages((prev) => [...prev, msgData]);

		// 2) Send to server via REST to update DB
		try {
			await updateSupportCase(caseId, { conversation: msgData });
			// 3) Also let Socket.io know so agent sees it immediately
			socket.emit("sendMessage", msgData);
			setNewMessage("");
			socket.emit("stopTyping", { user: customerName, caseId });
		} catch (err) {
			console.error("Error sending message:", err);
		}
	};

	/* ==================================================================
	 * CLOSE CHAT => SHOW RATING
	 * ================================================================== */
	const handleCloseChat = () => {
		setIsRatingVisible(true);
	};

	/* ==================================================================
	 * RATE SERVICE
	 * ================================================================== */
	const handleRateService = async (starVal) => {
		try {
			await updateSupportCase(caseId, {
				rating: starVal,
				caseStatus: "closed",
				closedBy: "client",
			});
			setIsRatingVisible(false);
			localStorage.removeItem("currentChat");
			closeChatWindow();
			message.success("Thank you for your feedback!");
		} catch (err) {
			console.error("Error rating support case:", err);
		}
	};

	/* ==================================================================
	 * SKIP RATING
	 * ================================================================== */
	const handleSkipRating = async () => {
		try {
			await updateSupportCase(caseId, {
				caseStatus: "closed",
				closedBy: "client",
			});
			localStorage.removeItem("currentChat");
			setIsRatingVisible(false);
			closeChatWindow();
		} catch (err) {
			console.error("Error closing support case:", err);
		}
	};

	/* ==================================================================
	 * TYPING
	 * ================================================================== */
	const handleInputChange = (e) => {
		setNewMessage(e.target.value);
		if (caseId) {
			socket.emit("typing", { caseId, user: customerName });
		}
	};

	const handleStopTyping = () => {
		if (caseId) {
			socket.emit("stopTyping", { caseId, user: customerName });
		}
	};

	/* ==================================================================
	 * EMOJI PICKER
	 * ================================================================== */
	const handleEmojiClick = (emojiObject) => {
		setNewMessage((prev) => prev + emojiObject.emoji);
		setShowEmojiPicker(false);
	};

	/* ==================================================================
	 * FILE UPLOADS
	 * ================================================================== */
	const handleFileChange = ({ fileList: newFileList }) => {
		setFileList(newFileList);
		// If you want to actually upload, handle that server-side, etc.
	};

	/* ==================================================================
	 * UTILS
	 * ================================================================== */
	const renderLinks = useCallback((txt) => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return txt.split(urlRegex).map((part, i) => {
			if (part.match(urlRegex)) {
				return (
					<a href={part} key={i} target='_blank' rel='noreferrer'>
						{part}
					</a>
				);
			}
			return part;
		});
	}, []);

	const isMine = (msg) => {
		return msg.messageBy?.customerEmail === customerEmail;
	};

	/* ==================================================================
     RENDER
  ================================================================== */
	return (
		<ChatWindowWrapper>
			<Header>
				<h3>
					{chosenLanguage === "Arabic" ? "دعم العملاء" : "Customer Support"}
				</h3>
				<Button
					type='text'
					icon={<CloseOutlined />}
					onClick={closeChatWindow}
				/>
			</Header>

			{isRatingVisible ? (
				<RatingContainer>
					<h4>
						{chosenLanguage === "Arabic" ? "قيم خدمتنا" : "Rate Our Service"}
					</h4>
					<StarRatings
						rating={rating}
						starRatedColor='#faad14'
						changeRating={(val) => setRating(val)}
						numberOfStars={5}
						name='rating'
						starDimension='24px'
					/>
					<div className='rating-buttons'>
						<Button type='primary' onClick={() => handleRateService(rating)}>
							{chosenLanguage === "Arabic" ? "إرسال التقييم" : "Submit Rating"}
						</Button>
						<Button onClick={handleSkipRating}>
							{chosenLanguage === "Arabic" ? "تخطي" : "Skip"}
						</Button>
					</div>
				</RatingContainer>
			) : submitted ? (
				<>
					{/* --------------- Chat in progress --------------- */}
					<MessagesSection>
						{messages.map((msg, idx) => {
							const mine = isMine(msg);
							return (
								<MessageBubble key={idx} isMine={mine}>
									<strong>{msg.messageBy.customerName}:</strong>{" "}
									{renderLinks(msg.message)}
									<small>{new Date(msg.date).toLocaleString()}</small>
								</MessageBubble>
							);
						})}

						{typingStatus && (
							<TypingIndicator>
								<span className='typing-text'>{typingStatus}</span>
								<span className='dot'></span>
								<span className='dot'></span>
								<span className='dot'></span>
							</TypingIndicator>
						)}
						<div ref={messagesEndRef} />
					</MessagesSection>

					<Form.Item>
						<ChatInputContainer>
							<Input.TextArea
								placeholder={
									chosenLanguage === "Arabic"
										? "اكتب رسالتك..."
										: "Type your message..."
								}
								value={newMessage}
								onChange={handleInputChange}
								onBlur={handleStopTyping}
								autoSize={{ minRows: 1, maxRows: 6 }}
								onPressEnter={(e) => {
									if (!e.shiftKey) {
										e.preventDefault();
										handleSendMessage();
									}
								}}
							/>
							<Button onClick={() => setShowEmojiPicker((prev) => !prev)}>
								😀
							</Button>
							{showEmojiPicker && (
								<EmojiPickerWrapper>
									<EmojiPicker onEmojiClick={handleEmojiClick} />
								</EmojiPickerWrapper>
							)}
							<Upload
								fileList={fileList}
								onChange={handleFileChange}
								beforeUpload={() => false}
							>
								<Button icon={<UploadOutlined />} />
							</Upload>
						</ChatInputContainer>

						<Button
							type='primary'
							block
							onClick={handleSendMessage}
							style={{ marginTop: 8 }}
						>
							{chosenLanguage === "Arabic" ? "إرسال" : "Send"}
						</Button>

						<Button
							type='default'
							block
							onClick={handleCloseChat}
							style={{ marginTop: 8, background: "#ff4d4f", color: "#fff" }}
						>
							<CloseOutlined />{" "}
							{chosenLanguage === "Arabic" ? "إغلاق المحادثة" : "Close Chat"}
						</Button>
					</Form.Item>
				</>
			) : (
				// --------------- Initial Form ---------------
				<Form layout='vertical' onFinish={handleSubmit}>
					{/* Full Name */}
					<Form.Item label='Full Name' required>
						<Input
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder='FirstName LastName'
							disabled={!!customerName} // if there's a pre-populated name, disable
							style={
								customerName
									? { background: "#f5f5f5", color: "#666" }
									: undefined
							}
						/>
					</Form.Item>

					{/* Email or Phone */}
					<Form.Item label='Email or Phone' required>
						<Input
							value={customerEmail}
							onChange={(e) => setCustomerEmail(e.target.value)}
							placeholder='client@gmail.com or 1234567890'
							disabled={!!customerEmail} // if there's a pre-populated email/phone, disable
							style={
								customerEmail
									? { background: "#f5f5f5", color: "#666" }
									: undefined
							}
						/>
					</Form.Item>

					{/* If user is on single-property route & propertyDetails => read-only property */}
					{matchSingleProperty && propertyDetails && propertyDetails._id ? (
						<Form.Item label='Property'>
							<Input
								value={
									propertyDetails.propertyName || "Talk with Property Agent"
								}
								disabled
								style={{ background: "#f5f5f5", color: "#666" }}
							/>
						</Form.Item>
					) : (
						/* Otherwise show the dropdown of active properties */
						<Form.Item label='Select Property'>
							<Select
								allowClear
								showSearch
								placeholder='(Optional) Choose a Property or chat with Admin'
								value={propertyId || undefined}
								onChange={(value) => setPropertyId(value)}
								filterOption={(input, option) =>
									option.children.toLowerCase().includes(input.toLowerCase())
								}
							>
								<Option value=''>Talk with Platform Admin</Option>
								{activeProperties.map((prop) => (
									<Option key={prop._id} value={prop._id}>
										{prop.propertyName}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}

					{/* If on SinglePropertyPage => "Talk with Property Agent" forced */}
					{matchSingleProperty && propertyDetails && propertyDetails._id ? (
						<Form.Item label='Inquiry About' required>
							<Input
								value='Talk with Property Agent'
								disabled
								style={{ background: "#f5f5f5", color: "#666" }}
							/>
						</Form.Item>
					) : (
						<Form.Item label='Inquiry About' required>
							<Select
								placeholder='Choose your inquiry'
								value={inquiryAbout}
								onChange={setInquiryAbout}
							>
								{INQUIRY_TYPES.map((opt) => (
									<Option key={opt.value} value={opt.value}>
										{opt.label}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}

					{/* 'others' => text input, 'reservation' => reservationNumber */}
					{inquiryAbout === "others" && (
						<Form.Item label='Please specify your inquiry'>
							<Input
								value={otherInquiry}
								onChange={(e) => setOtherInquiry(e.target.value)}
							/>
						</Form.Item>
					)}

					{inquiryAbout === "reservation" && (
						<Form.Item label='Reservation Confirmation Number'>
							<Input
								value={reservationNumber}
								onChange={(e) => setReservationNumber(e.target.value)}
							/>
						</Form.Item>
					)}

					<Button type='primary' htmlType='submit' block>
						{chosenLanguage === "Arabic" ? "بدء المحادثة" : "Start Chat"}
					</Button>
				</Form>
			)}
		</ChatWindowWrapper>
	);
};

export default ChatWindow;

/* ----------------- STYLED COMPONENTS ----------------- */

const ChatWindowWrapper = styled.div`
	position: fixed;
	bottom: 70px;
	right: 20px;
	width: 350px;
	max-width: 90%;
	height: 70vh;
	max-height: 80vh;
	background: #fff;
	border: 1px solid #ccc;
	border-radius: 8px;
	z-index: 1001;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
	padding: 20px;
	overflow: hidden;

	@media (max-width: 768px) {
		bottom: 85px;
		right: 5%;
		width: 90%;
		height: 80vh;
	}
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
`;

const MessagesSection = styled.div`
	max-height: 55vh;
	margin-bottom: 10px;
	overflow-y: auto;
	scroll-behavior: smooth;
`;

const MessageBubble = styled.div`
	margin-bottom: 8px;
	padding: 8px;
	border-radius: 6px;
	line-height: 1.4;
	background: ${(props) => (props.isMine ? "#d2f8d2" : "#f5f5f5")};

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

const typingBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
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
		width: 6px;
		height: 6px;
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

const RatingContainer = styled.div`
	text-align: center;
	.rating-buttons {
		margin-top: 16px;
		display: flex;
		justify-content: center;
		gap: 10px;
	}
`;

const ChatInputContainer = styled.div`
	display: flex;
	gap: 4px;
	textarea {
		flex: 1;
		resize: none;
	}
`;

const EmojiPickerWrapper = styled.div`
	position: absolute;
	bottom: 60px;
	right: 20px;
	z-index: 9999;
	background: #fff;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;
