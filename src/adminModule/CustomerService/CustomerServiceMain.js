/** @format */
// CustomerServiceMain.js (for Admin)
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Tabs, Radio } from "antd";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import {
	adminGetActiveB2CChats,
	adminGetClosedB2CChats,
	adminGetActiveB2BChats,
	adminGetClosedB2BChats,
} from "../apiAdmin";
import { isAuthenticated } from "../../auth";
import ChatDetailPropertyAdmin from "./ChatDetailPropertyAdmin";
import socket from "../../socket";

const { TabPane } = Tabs;

const CustomerServiceMain = () => {
	// 1) Layout states
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	// 2) Extract user/token **once** so they're stable references
	//    This prevents the infinite effect loop if isAuthenticated() returns a new object every time.
	const { user: initialUser, token: initialToken } = isAuthenticated() || {};
	// Store them in local state or memo so they do NOT change references on re-render
	const [adminUser] = useState(initialUser);
	const [adminToken] = useState(initialToken);

	// 3) Chat data states
	const [b2cActive, setB2cActive] = useState([]);
	const [b2bActive, setB2bActive] = useState([]);
	const [b2cHistory, setB2cHistory] = useState([]);
	const [b2bHistory, setB2bHistory] = useState([]);

	// 4) Tabs & filters
	const storedTab = localStorage.getItem("adminActiveTab") || "b2cActive";
	const [activeTab, setActiveTab] = useState(storedTab);

	const storedHistoryFilter =
		localStorage.getItem("adminHistoryFilter") || "b2c";
	const [historyFilter, setHistoryFilter] = useState(storedHistoryFilter);

	// 5) Selected chat
	const storedSelectedChat = localStorage.getItem("adminSelectedChat");
	const [selectedChat, setSelectedChat] = useState(
		storedSelectedChat ? JSON.parse(storedSelectedChat) : null
	);

	// Collapse sidebar on small screens (one-time)
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	/*
	 * ============== FETCH FUNCTIONS (useCallback) ==============
	 * Using adminUser / adminToken from stable states above
	 */
	const fetchActiveB2C = useCallback(() => {
		if (!adminUser || !adminToken) return;
		adminGetActiveB2CChats(adminUser._id, adminToken)
			.then((data) => {
				if (data && !data.error) setB2cActive(data);
			})
			.catch((err) => console.error(err));
	}, [adminUser, adminToken]);

	const fetchActiveB2B = useCallback(() => {
		if (!adminUser || !adminToken) return;
		adminGetActiveB2BChats(adminUser._id, adminToken)
			.then((data) => {
				if (data && !data.error) setB2bActive(data);
			})
			.catch((err) => console.error(err));
	}, [adminUser, adminToken]);

	const fetchClosedB2C = useCallback(() => {
		if (!adminUser || !adminToken) return;
		adminGetClosedB2CChats(adminUser._id, adminToken)
			.then((data) => {
				if (data && !data.error) setB2cHistory(data);
			})
			.catch((err) => console.error(err));
	}, [adminUser, adminToken]);

	const fetchClosedB2B = useCallback(() => {
		if (!adminUser || !adminToken) return;
		adminGetClosedB2BChats(adminUser._id, adminToken)
			.then((data) => {
				if (data && !data.error) setB2bHistory(data);
			})
			.catch((err) => console.error(err));
	}, [adminUser, adminToken]);

	/*
	 * ============== HANDLE TAB CHANGE ==============
	 */
	const handleTabChange = (newActiveKey) => {
		setActiveTab(newActiveKey);
		localStorage.setItem("adminActiveTab", newActiveKey);

		// Clear selected chat
		setSelectedChat(null);
		localStorage.removeItem("adminSelectedChat");
	};

	/*
	 * ============== HANDLE HISTORY FILTER CHANGE ==============
	 */
	const handleHistoryFilterChange = (e) => {
		const value = e.target.value;
		setHistoryFilter(value);
		localStorage.setItem("adminHistoryFilter", value);

		// Clear selected chat
		setSelectedChat(null);
		localStorage.removeItem("adminSelectedChat");
	};

	/*
	 * ============== USEEFFECT: FETCH WHENEVER activeTab/histFilter CHANGE ==============
	 * Now we DO NOT have user/token in the dependency array directly,
	 * but the fetch callbacks do reference them inside (via stable local states).
	 */
	useEffect(() => {
		console.log(
			"useEffect triggered: activeTab =",
			activeTab,
			" historyFilter =",
			historyFilter
		);

		// If no user or token, do nothing
		if (!adminUser || !adminToken) return;

		if (activeTab === "b2cActive") {
			fetchActiveB2C();
		} else if (activeTab === "b2bActive") {
			fetchActiveB2B();
		} else if (activeTab === "history") {
			if (historyFilter === "b2c") {
				fetchClosedB2C();
			} else {
				fetchClosedB2B();
			}
		}
	}, [
		activeTab,
		historyFilter,
		adminUser,
		adminToken,
		fetchActiveB2C,
		fetchActiveB2B,
		fetchClosedB2C,
		fetchClosedB2B,
	]);

	/*
	 * ============== SOCKET HANDLERS ==============
	 */
	useEffect(() => {
		const handleNewChat = (newCase) => {
			if (newCase.caseStatus === "open" && newCase.openedBy === "client") {
				setB2cActive((prev) => [...prev, newCase]);
			} else if (
				newCase.caseStatus === "open" &&
				["agent", "super admin"].includes(newCase.openedBy)
			) {
				setB2bActive((prev) => [...prev, newCase]);
			}
		};

		const handleCloseCase = (payload) => {
			const closedCase = payload.case;
			const { openedBy } = closedCase;

			if (openedBy === "client") {
				setB2cActive((prev) => prev.filter((c) => c._id !== closedCase._id));
				setB2cHistory((prev) => [...prev, closedCase]);
			} else {
				setB2bActive((prev) => prev.filter((c) => c._id !== closedCase._id));
				setB2bHistory((prev) => [...prev, closedCase]);
			}

			if (selectedChat && selectedChat._id === closedCase._id) {
				setSelectedChat(null);
				localStorage.removeItem("adminSelectedChat");
			}
		};

		const handleReceiveMessage = (updatedCase) => {
			if (updatedCase.openedBy === "client") {
				setB2cActive((prev) =>
					prev.map((c) => (c._id === updatedCase._id ? updatedCase : c))
				);
			} else {
				setB2bActive((prev) =>
					prev.map((c) => (c._id === updatedCase._id ? updatedCase : c))
				);
			}

			if (selectedChat && selectedChat._id === updatedCase._id) {
				setSelectedChat(updatedCase);
				localStorage.setItem("adminSelectedChat", JSON.stringify(updatedCase));
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
	}, [selectedChat]);

	/*
	 * ============== SELECT A CHAT ==============
	 */
	const handleSelectChat = (oneCase) => {
		setSelectedChat(oneCase);
		localStorage.setItem("adminSelectedChat", JSON.stringify(oneCase));
	};

	/*
	 * ============== RENDER CASE LIST ==============
	 */
	const renderCasesList = (casesArray) => {
		if (!casesArray || casesArray.length === 0) {
			return <p style={{ padding: "10px" }}>No chats found.</p>;
		}

		return casesArray.map((oneChat) => {
			const isSelected = selectedChat && selectedChat._id === oneChat._id;
			return (
				<CaseItem
					key={oneChat._id}
					onClick={() => handleSelectChat(oneChat)}
					isSelected={isSelected}
				>
					<strong>{oneChat.displayName1}</strong>
					<small style={{ display: "block", color: "#555" }}>
						{oneChat.caseStatus}
					</small>
				</CaseItem>
			);
		});
	};

	return (
		<CustomerServiceMainWrapper show={collapsed}>
			<div className='grid-container-main'>
				{/* Left Nav */}
				<div className='navcontent'>
					<AdminNavbar
						fromPage='CustomerService'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				{/* Main Content */}
				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<Tabs activeKey={activeTab} onChange={handleTabChange}>
							<TabPane tab='Active B2C' key='b2cActive'>
								<InnerTabLayout>
									<LeftColumn>{renderCasesList(b2cActive)}</LeftColumn>
									<RightColumn>
										{selectedChat ? (
											<ChatDetailPropertyAdmin
												key={selectedChat._id}
												chat={selectedChat}
												isHistory={false}
												fetchChats={fetchActiveB2C}
											/>
										) : (
											<Placeholder>Select a chat</Placeholder>
										)}
									</RightColumn>
								</InnerTabLayout>
							</TabPane>

							<TabPane tab='Active B2B' key='b2bActive'>
								<InnerTabLayout>
									<LeftColumn>{renderCasesList(b2bActive)}</LeftColumn>
									<RightColumn>
										{selectedChat ? (
											<ChatDetailPropertyAdmin
												key={selectedChat._id}
												chat={selectedChat}
												isHistory={false}
												fetchChats={fetchActiveB2B}
											/>
										) : (
											<Placeholder>Select a chat</Placeholder>
										)}
									</RightColumn>
								</InnerTabLayout>
							</TabPane>

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
											<ChatDetailPropertyAdmin
												key={selectedChat._id}
												chat={selectedChat}
												isHistory={true}
												fetchChats={
													historyFilter === "b2c"
														? fetchClosedB2C
														: fetchClosedB2B
												}
											/>
										) : (
											<Placeholder>Select a chat from history</Placeholder>
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

export default CustomerServiceMain;

/* ------------------- STYLED COMPONENTS ------------------- */
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
	background: ${({ isSelected }) => (isSelected ? "#d3e0fa" : "#fff")};
	margin-bottom: 8px;
	border: 1px solid #ddd;
	border-radius: 6px;
	padding: 8px;
	transition: background 0.2s ease;

	&:hover {
		background: #e8e8e8;
	}
`;

const Placeholder = styled.div`
	text-align: center;
	color: #888;
	margin-top: 50px;
`;
