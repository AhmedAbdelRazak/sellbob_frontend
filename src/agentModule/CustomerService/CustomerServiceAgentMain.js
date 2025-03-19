/** @format */
// CustomerServiceAgentMain.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Tabs, Button, Radio } from "antd";
import { useLocation, useHistory } from "react-router-dom"; // ADDED
import AdminNavbar from "../AgentNavbar/AgentNavbar";
import { isAuthenticated } from "../../auth";

// Import your agent-related API calls
import {
	getActiveB2CChats,
	getActiveB2BChats,
	getClosedB2CChats,
	getClosedB2BChats,
	createB2BSupportCase,
	markAllMessagesAsSeenByAgent, // call the route that sets seenByAgent & seenByAdmin
} from "../apiAgent";

// Import socket instance
import socket from "../../socket";

import ChatDetailProperty from "./ChatDetailProperty";

const { TabPane } = Tabs;

const CustomerServiceAgentMain = ({ chosenLanguage }) => {
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	const auth = isAuthenticated() || {};
	const user = auth.user || {};
	const token = auth.token || "";

	// ADDED: We'll track agentId from the URL or localStorage, fallback to user._id
	const [agentId, setAgentId] = useState("");

	const location = useLocation(); // ADDED
	const history = useHistory(); // ADDED

	// Data states
	const [b2cActive, setB2cActive] = useState([]);
	const [b2bActive, setB2bActive] = useState([]);
	const [b2cHistory, setB2cHistory] = useState([]);
	const [b2bHistory, setB2bHistory] = useState([]);

	// Keep track of which tab is currently active (store in localStorage)
	const storedTab = localStorage.getItem("agentActiveTab") || "b2cActive";
	const [activeTab, setActiveTab] = useState(storedTab);

	// Keep track of which chat is selected (store in localStorage)
	const storedSelectedChat = localStorage.getItem("agentSelectedChat");
	const [selectedChat, setSelectedChat] = useState(
		storedSelectedChat ? JSON.parse(storedSelectedChat) : null
	);

	// For the History tab: sub-buttons for b2c or b2b
	const storedHistoryFilter =
		localStorage.getItem("agentHistoryFilter") || "b2c";
	const [historyFilter, setHistoryFilter] = useState(storedHistoryFilter);

	// On mount, or on window resize
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	/* -------------------------------------
	 * AGENT PARAM LOGIC (Avoid infinite loop)
	 * ------------------------------------- */
	const userId = auth.user?._id;

	useEffect(() => {
		if (!userId) return; // Not logged in or userId not ready

		const searchParams = new URLSearchParams(location.search);
		const existingAgent = searchParams.get("agent");

		const storedAgentId = localStorage.getItem("agentId")?.trim() || "";
		const finalAgentId = storedAgentId !== "" ? storedAgentId : userId; // fallback

		if (existingAgent !== finalAgentId) {
			searchParams.set("agent", finalAgentId);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
		}

		setAgentId(finalAgentId);
	}, [userId, location, history]);

	/* -------------------------------------
	 * FETCHING DATA (Now uses agentId)
	 * ------------------------------------- */
	const fetchActiveB2C = () => {
		if (agentId && token) {
			// CHANGED: pass agentId
			getActiveB2CChats(agentId, token).then((data) => {
				if (data && !data.error) {
					setB2cActive(data);
				}
			});
		}
	};

	const fetchActiveB2B = () => {
		if (agentId && token) {
			getActiveB2BChats(agentId, token).then((data) => {
				if (data && !data.error) {
					setB2bActive(data);
				}
			});
		}
	};

	const fetchClosedB2C = () => {
		if (agentId && token) {
			getClosedB2CChats(agentId, token).then((data) => {
				if (data && !data.error) {
					setB2cHistory(data);
				}
			});
		}
	};

	const fetchClosedB2B = () => {
		if (agentId && token) {
			getClosedB2BChats(agentId, token).then((data) => {
				if (data && !data.error) {
					setB2bHistory(data);
				}
			});
		}
	};

	/* -------------------------------------
	 * HANDLE TAB & HISTORY FILTER CHANGES
	 * ------------------------------------- */
	const handleTabChange = (newActiveKey) => {
		setActiveTab(newActiveKey);
		localStorage.setItem("agentActiveTab", newActiveKey);
		setSelectedChat(null);
		localStorage.removeItem("agentSelectedChat");

		switch (newActiveKey) {
			case "b2cActive":
				fetchActiveB2C();
				break;
			case "b2bActive":
				fetchActiveB2B();
				break;
			case "history":
				if (historyFilter === "b2c") {
					fetchClosedB2C();
				} else {
					fetchClosedB2B();
				}
				break;
			default:
				break;
		}
	};

	const handleHistoryFilterChange = (e) => {
		const value = e.target.value;
		setHistoryFilter(value);
		localStorage.setItem("agentHistoryFilter", value);

		setSelectedChat(null);
		localStorage.removeItem("agentSelectedChat");

		if (value === "b2c") {
			fetchClosedB2C();
		} else {
			fetchClosedB2B();
		}
	};

	/* -------------------------------------
	 * ON MOUNT: FETCH THE STORED TAB'S DATA
	 * ------------------------------------- */
	useEffect(() => {
		// Only fetch if we have agentId
		if (!agentId) return;
		if (activeTab === "b2cActive") fetchActiveB2C();
		if (activeTab === "b2bActive") fetchActiveB2B();
		if (activeTab === "history") {
			if (historyFilter === "b2c") fetchClosedB2C();
			else fetchClosedB2B();
		}
		// eslint-disable-next-line
	}, [agentId]);

	/* -------------------------------------
	 * SOCKET.IO EVENT HANDLERS
	 * ------------------------------------- */
	useEffect(() => {
		const handleNewChat = (newCase) => {
			if (newCase.caseStatus !== "open") return;

			// If openedBy "client" => B2C
			if (newCase.openedBy === "client") {
				// super admin = role 1000 => sees all
				// agent = role 2000,3000,7000 => only if newCase.targetAgentId === agentId
				if (user.role === 1000) {
					setB2cActive((prev) => [...prev, newCase]);
				} else if ([2000, 3000, 7000].includes(user.role)) {
					if (newCase.targetAgentId === agentId) {
						setB2cActive((prev) => [...prev, newCase]);
					}
				}
			} else {
				// B2B
				setB2bActive((prev) => [...prev, newCase]);
			}
		};

		const handleCloseCase = (payload) => {
			const closedCase = payload.case;
			const { openedBy, targetAgentId } = closedCase;

			if (openedBy === "client") {
				// B2C
				if (user.role === 1000) {
					// superadmin sees everything
					setB2cActive((prev) => prev.filter((c) => c._id !== closedCase._id));
					setB2cHistory((prev) => [...prev, closedCase]);
				} else if ([2000, 3000, 7000].includes(user.role)) {
					// agent sees only if it belongs to them
					if (targetAgentId === agentId) {
						setB2cActive((prev) =>
							prev.filter((c) => c._id !== closedCase._id)
						);
						setB2cHistory((prev) => [...prev, closedCase]);
					}
				}
			} else {
				// B2B => agent ↔ super admin
				setB2bActive((prev) => prev.filter((c) => c._id !== closedCase._id));
				setB2bHistory((prev) => [...prev, closedCase]);
			}

			// If the currently selected chat was closed, clear it
			if (selectedChat && selectedChat._id === closedCase._id) {
				setSelectedChat(null);
				localStorage.removeItem("agentSelectedChat");
			}
		};

		const handleReceiveMessage = (updatedCase) => {
			// B2C or B2B
			if (updatedCase.openedBy === "client") {
				setB2cActive((prev) =>
					prev.map((c) => (c._id === updatedCase._id ? updatedCase : c))
				);
			} else {
				setB2bActive((prev) =>
					prev.map((c) => (c._id === updatedCase._id ? updatedCase : c))
				);
			}

			// If currently viewing that chat, mark as seen
			if (selectedChat && selectedChat._id === updatedCase._id) {
				// CHANGED: pass agentId
				markAllMessagesAsSeenByAgent(updatedCase._id, agentId, token).then(
					() => {
						const updatedConv = updatedCase.conversation.map((m) => ({
							...m,
							seenByAgent: true,
							seenByAdmin: true,
						}));
						const newSelected = { ...updatedCase, conversation: updatedConv };
						setSelectedChat(newSelected);
						localStorage.setItem(
							"agentSelectedChat",
							JSON.stringify(newSelected)
						);
					}
				);
			}
		};

		socket.on("newChat", handleNewChat);
		socket.on("closeCase", handleCloseCase);
		socket.on("receiveMessage", handleReceiveMessage);

		return () => {
			socket.off("newChat", handleNewChat);
			socket.off("closeCase", handleCloseCase);
			socket.off("receiveMessage", handleReceiveMessage);
		};
		// eslint-disable-next-line
	}, [selectedChat, token, agentId, user.role]);

	/* -------------------------------------
	 * CREATE B2B SUPPORT CASE
	 * ------------------------------------- */
	const handleCreateB2BCase = () => {
		// CHANGED: use agentId for the IDs, but keep name/email from user if desired
		const newCaseData = {
			customerName: user.name,
			customerEmail: user.email,
			inquiryAbout: "General Inquiry to Admin",
			inquiryDetails: "Hello Admin, I need support regarding my listings.",
			supporterId: agentId,
			ownerId: agentId,
			propertyId: null,
			role: user.role || 2000, // Keep user's role
			displayName1: user.name,
			displayName2: "Admin Support",
			supporterName: user.name,
		};

		createB2BSupportCase(agentId, token, newCaseData).then((res) => {
			if (res && !res.error) {
				fetchActiveB2B(); // or rely on "newChat" event
				setSelectedChat(res);
				localStorage.setItem("agentSelectedChat", JSON.stringify(res));
			}
		});
	};

	/* -------------------------------------
	 * SELECT A CHAT & MARK AS READ
	 * ------------------------------------- */
	const handleSelectChat = (chatToSelect) => {
		markAllMessagesAsSeenByAgent(chatToSelect._id, agentId, token)
			.then(() => {
				const updateConversationForAgentAndAdmin = (oneChat) => {
					if (oneChat._id !== chatToSelect._id) return oneChat;

					const updatedConversation = oneChat.conversation.map((m) => ({
						...m,
						seenByAgent: true,
						seenByAdmin: true,
					}));
					return { ...oneChat, conversation: updatedConversation };
				};

				setB2cActive((prev) => prev.map(updateConversationForAgentAndAdmin));
				setB2bActive((prev) => prev.map(updateConversationForAgentAndAdmin));

				const updatedChat = {
					...chatToSelect,
					conversation: chatToSelect.conversation.map((m) => ({
						...m,
						seenByAgent: true,
						seenByAdmin: true,
					})),
				};
				setSelectedChat(updatedChat);
				localStorage.setItem("agentSelectedChat", JSON.stringify(updatedChat));
			})
			.catch((err) => {
				console.error("Error in handleSelectChat:", err);
			});
	};

	/* -------------------------------------
	 * RENDER HELPER
	 * ------------------------------------- */
	function getUnseenCountForAgent(oneCase, agentUserId) {
		if (!oneCase.conversation) return 0;
		return oneCase.conversation.filter(
			(msg) => !msg.seenByAgent && msg.messageBy.userId !== agentUserId
		).length;
	}

	const renderCasesList = (casesArray) => {
		if (!casesArray || casesArray.length === 0) {
			return <p style={{ padding: "10px" }}>No chats found.</p>;
		}

		return casesArray.map((oneChat) => {
			const unseenCount = getUnseenCountForAgent(oneChat, agentId);

			return (
				<CaseItem
					key={oneChat._id}
					onClick={() => handleSelectChat(oneChat)}
					isSelected={selectedChat && selectedChat._id === oneChat._id}
					hasUnseen={unseenCount > 0}
				>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<strong>{oneChat.displayName1}</strong>
						{unseenCount > 0 && <Badge>{unseenCount}</Badge>}
					</div>
					<small style={{ display: "block", color: "#555" }}>
						Status: {oneChat.caseStatus}
					</small>
				</CaseItem>
			);
		});
	};

	return (
		<CustomerServiceMainWrapper
			dir={chosenLanguage === "Arabic" ? "rtl" : "ltr"}
			show={collapsed}
		>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='Support'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
						chosenLanguage={chosenLanguage}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<Tabs activeKey={activeTab} onChange={handleTabChange}>
							{/* ---------- B2C ACTIVE TAB ---------- */}
							<TabPane tab='Active B2C' key='b2cActive'>
								<InnerTabLayout>
									<LeftColumn>{renderCasesList(b2cActive)}</LeftColumn>
									<RightColumn>
										{selectedChat ? (
											<ChatDetailProperty
												key={selectedChat._id}
												chat={selectedChat}
												isHistory={false}
												fetchChats={fetchActiveB2C}
												chosenLanguage={chosenLanguage}
											/>
										) : (
											<Placeholder>Select a Chat</Placeholder>
										)}
									</RightColumn>
								</InnerTabLayout>
							</TabPane>

							{/* ---------- B2B ACTIVE TAB ---------- */}
							<TabPane tab='Active B2B' key='b2bActive'>
								<Button
									type='primary'
									onClick={handleCreateB2BCase}
									style={{ marginBottom: 16 }}
								>
									Create New Support Case w/ Admin
								</Button>
								<InnerTabLayout>
									<LeftColumn>{renderCasesList(b2bActive)}</LeftColumn>
									<RightColumn>
										{selectedChat ? (
											<ChatDetailProperty
												key={selectedChat._id}
												chat={selectedChat}
												isHistory={false}
												fetchChats={fetchActiveB2B}
												chosenLanguage={chosenLanguage}
											/>
										) : (
											<Placeholder>Select a Chat</Placeholder>
										)}
									</RightColumn>
								</InnerTabLayout>
							</TabPane>

							{/* ---------- HISTORICAL TAB ---------- */}
							<TabPane tab='History' key='history'>
								<Radio.Group
									onChange={handleHistoryFilterChange}
									value={historyFilter}
									style={{ marginBottom: 16 }}
								>
									<Radio.Button value='b2c'>B2C Chats</Radio.Button>
									<Radio.Button value='b2b'>B2B Chats</Radio.Button>
								</Radio.Group>

								<InnerTabLayout>
									<LeftColumn>
										{historyFilter === "b2c"
											? renderCasesList(b2cHistory)
											: renderCasesList(b2bHistory)}
									</LeftColumn>
									<RightColumn>
										{selectedChat ? (
											<ChatDetailProperty
												key={selectedChat._id}
												chat={selectedChat}
												isHistory={true}
												fetchChats={
													historyFilter === "b2c"
														? fetchClosedB2C
														: fetchClosedB2B
												}
												chosenLanguage={chosenLanguage}
											/>
										) : (
											<Placeholder>Select a Chat from History</Placeholder>
										)}
									</RightColumn>
								</InnerTabLayout>
							</TabPane>
						</Tabs>
					</div>
				</div>
			</div>
		</CustomerServiceMainWrapper>
	);
};

export default CustomerServiceAgentMain;

/* -------------------------------------- */
/*         STYLED COMPONENTS             */
/* -------------------------------------- */

const CustomerServiceMainWrapper = styled.div`
	overflow-x: hidden;
	margin-top: 20px;
	min-height: 715px;

	.grid-container-main {
		display: grid;
		grid-template-columns: ${(props) => (props.show ? "5% 75%" : "17% 75%")};
	}

	.container-wrapper {
		border: 2px solid lightgrey;
		padding: 20px;
		border-radius: 20px;
		background: var(--mainWhite);
		margin: 0px 10px;
		width: 100%;
	}
`;

const InnerTabLayout = styled.div`
	display: flex;
	flex-direction: row;
	gap: 1rem;
	height: 83vh;
`;

const LeftColumn = styled.div`
	width: 20%;
	background: #f9f9f9;
	border-right: 1px solid #ccc;
	overflow-y: auto;
	padding: 10px;
`;

const RightColumn = styled.div`
	width: 80%;
	padding: 10px;
`;

const CaseItem = styled.div`
	cursor: pointer;
	background: ${({ isSelected, hasUnseen }) =>
		isSelected ? "#d3e0fa" : hasUnseen ? "#ffe5e5" : "#fff"};
	margin-bottom: 8px;
	border: 1px solid #ddd;
	border-radius: 6px;
	padding: 8px;
	transition: background 0.2s ease;

	&:hover {
		background: #e8e8e8;
	}
`;

const Badge = styled.span`
	background: red;
	color: white;
	border-radius: 50%;
	padding: 0 8px;
	font-size: 0.75rem;
	margin-left: 6px;
`;

const Placeholder = styled.div`
	text-align: center;
	color: #888;
	margin-top: 50px;
`;
