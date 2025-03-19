/** @format */
// ChatIcon.js
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { MessageOutlined } from "@ant-design/icons"; // Example icon
import ChatWindow from "./ChatWindow";
import socket from "../socket"; // your socket instance
import { getUnseenMessagesCountByCustomer } from "../apiCore";
import notificationSound from "./Notification.wav";
import { useCartContext } from "../cart_context";

// Simple blink animation for the status dot
const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const ChatIconWrapper = styled.div`
	position: fixed;
	bottom: 20px;
	right: 20px;
	z-index: 1000;
	display: flex;
	align-items: center;
	cursor: pointer;

	@media (max-width: 750px) {
		bottom: 30px;
	}
`;

const ChatButtonBox = styled.div`
	display: flex;
	align-items: center;
	background-color: var(--primaryBlue);
	padding: 10px 14px;
	border-radius: 50px;
	box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.25);
	transition:
		transform 0.2s ease,
		background-color 0.2s ease;

	&:hover {
		transform: scale(1.05);
		background-color: #0b69d6;
	}

	.icon-holder {
		color: #fff;
		margin-right: 8px;
		font-size: 20px;
	}

	.chat-text {
		display: flex;
		flex-direction: column;
		color: #fff;
		text-align: left;
		font-weight: bold;
		line-height: 1.2;

		.chat-name {
			font-size: 14px;
		}
		.chat-status {
			font-size: 12px;
			font-weight: normal;
			display: flex;
			align-items: center;

			.status-dot {
				width: 8px;
				height: 8px;
				background-color: #00ff00;
				border-radius: 50%;
				margin-right: 5px;
				animation: ${blink} 3s infinite;
			}

			.unseen-count {
				background-color: red;
				color: white;
				border-radius: 50%;
				font-size: 10px;
				width: 18px;
				height: 18px;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-left: 10px;
			}
		}
	}

	@media (max-width: 750px) {
		padding: 8px 10px;
		.icon-holder {
			font-size: 18px;
			margin-right: 6px;
		}
		.chat-text {
			.chat-name {
				font-size: 13px;
			}
			.chat-status {
				font-size: 10px;
			}
		}
	}
`;

const ChatIcon = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [unseenCount, setUnseenCount] = useState(0);
	const [hasInteracted, setHasInteracted] = useState(false);
	const { chosenLanguage } = useCartContext();

	const [clientId, setClientId] = useState(null);

	useEffect(() => {
		const userFromLocal = JSON.parse(localStorage.getItem("user"));
		if (userFromLocal && userFromLocal._id) {
			setClientId(userFromLocal._id);
		}
	}, []);

	// Fetch unseen messages count if user is known
	const fetchUnseenMessagesCount = useCallback(async () => {
		if (!clientId) return;
		try {
			const { count } = await getUnseenMessagesCountByCustomer(clientId);
			setUnseenCount(count);
		} catch (error) {
			console.error("Error fetching unseen messages count:", error);
		}
	}, [clientId]);

	// Notification sound
	const playNotificationSound = useCallback(() => {
		if (hasInteracted) {
			const audio = new Audio(notificationSound);
			audio.play();
		}
	}, [hasInteracted]);

	// Track user interaction to allow audio
	const handleUserInteraction = useCallback(() => {
		setHasInteracted(true);
		document.removeEventListener("click", handleUserInteraction);
	}, []);

	useEffect(() => {
		document.addEventListener("click", handleUserInteraction);
		return () => {
			document.removeEventListener("click", handleUserInteraction);
		};
	}, [handleUserInteraction]);

	// Periodic unseen message fetching if chat is closed
	useEffect(() => {
		if (!isOpen && clientId) {
			fetchUnseenMessagesCount(); // run once immediately
			const intervalId = setInterval(fetchUnseenMessagesCount, 10000);
			return () => clearInterval(intervalId);
		}
	}, [isOpen, clientId, fetchUnseenMessagesCount]);

	// Listen for new messages from server
	useEffect(() => {
		const handleNewMessage = (updatedCaseOrMessage) => {
			// Because the user might have multiple cases, ideally we'd check if it's the same user
			// For simplicity, just play the sound if the chat window is not open
			// Then refetch unseen count:
			if (!isOpen) {
				playNotificationSound();
				fetchUnseenMessagesCount();
			}
		};

		socket.on("receiveMessage", handleNewMessage);

		return () => {
			socket.off("receiveMessage", handleNewMessage);
		};
	}, [isOpen, playNotificationSound, fetchUnseenMessagesCount]);

	const toggleChatWindow = () => {
		setIsOpen(!isOpen);
		// When opening the chat, reset local unseen count (locally only)
		if (!isOpen) {
			setUnseenCount(0);
		}
	};

	return (
		<ChatIconWrapper isArabic={chosenLanguage === "Arabic"}>
			<ChatButtonBox onClick={toggleChatWindow}>
				<div className='icon-holder'>
					<MessageOutlined />
				</div>
				<div className='chat-text'>
					<div className='chat-name'>
						{chosenLanguage === "Arabic" ? "مساعدة" : "Help / Support"}
					</div>
					<div className='chat-status'>
						<span className='status-dot' />
						{chosenLanguage === "Arabic" ? "الدردشة متاحة" : "Chat Available"}
						{unseenCount > 0 && (
							<span className='unseen-count'>{unseenCount}</span>
						)}
					</div>
				</div>
			</ChatButtonBox>

			{isOpen && (
				<ChatWindow
					closeChatWindow={toggleChatWindow}
					chosenLanguage={chosenLanguage}
				/>
			)}
		</ChatIconWrapper>
	);
};

export default ChatIcon;
