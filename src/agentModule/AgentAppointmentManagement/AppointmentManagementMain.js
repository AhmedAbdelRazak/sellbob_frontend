// AppointmentManagementMain.js

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useHistory } from "react-router-dom"; // ADDED
import { Tabs } from "antd";
import AdminNavbar from "../AgentNavbar/AgentNavbar";
import { isAuthenticated } from "../../auth";
import { gettingAgentProperties } from "../apiAgent";
import NewAppointmentForm from "./NewAppointmentForm";
import AppointmentsListTable from "./AppointmentsListTable";

const { TabPane } = Tabs;

const AppointmentManagementMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	// Restore the active tab from localStorage if available; else default to "newAppt"
	const storedTab = localStorage.getItem("appointmentActiveTab") || "newAppt";
	const [activeTab, setActiveTab] = useState(storedTab);

	const auth = isAuthenticated();
	const userId = auth.user?._id;
	const token = auth.token || "";

	// ADDED: We'll keep agentId in local state
	const [agentId, setAgentId] = useState("");

	const location = useLocation(); // ADDED
	const history = useHistory(); // ADDED

	// This holds the agent's properties
	const [agentProperties, setAgentProperties] = useState([]);
	const [didFetchProperties, setDidFetchProperties] = useState(false);

	// This state triggers a reload in AppointmentsListTable
	const [reloadFlag, setReloadFlag] = useState(false);

	// On mount, or window resize
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	/* ---------------------------------------
	 * AGENT PARAM LOGIC (avoid infinite loop)
	 * --------------------------------------- */
	useEffect(() => {
		if (!userId) return; // not logged in or user not loaded

		const searchParams = new URLSearchParams(location.search);
		const existingAgent = searchParams.get("agent");

		const storedAgentId = localStorage.getItem("agentId")?.trim() || "";
		const finalAgentId = storedAgentId !== "" ? storedAgentId : userId;

		// Only replace if different => prevents infinite loop
		if (existingAgent !== finalAgentId) {
			searchParams.set("agent", finalAgentId);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
		}

		setAgentId(finalAgentId);
	}, [userId, location, history]);

	// Fetch agent properties once we have agentId
	useEffect(() => {
		if (!didFetchProperties && agentId && token) {
			gettingAgentProperties(agentId, token).then((res) => {
				if (res && !res.error) {
					setAgentProperties(res);
				}
				setDidFetchProperties(true);
			});
		}
	}, [didFetchProperties, agentId, token]);

	const handleTabChange = (key) => {
		setActiveTab(key);
		localStorage.setItem("appointmentActiveTab", key);
	};

	/**
	 * Callback after a new appointment is successfully created.
	 * 1) Switch to the "Appointments List" tab
	 * 2) Toggle reloadFlag so the table re-fetches data
	 */
	const handleNewAppointmentSaved = () => {
		setActiveTab("apptList");
		localStorage.setItem("appointmentActiveTab", "apptList");
		setReloadFlag(!reloadFlag);
	};

	return (
		<AppointmentManagementMainWrapper>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='Appointments'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<Tabs activeKey={activeTab} onChange={handleTabChange}>
							<TabPane tab='New Appointment' key='newAppt'>
								<NewAppointmentForm
									agentProperties={agentProperties}
									userId={agentId} // CHANGED: pass agentId
									// Pass onSave callback => called after successful creation
									onSave={handleNewAppointmentSaved}
								/>
							</TabPane>

							<TabPane tab='Appointments List' key='apptList'>
								<AppointmentsListTable
									agentProperties={agentProperties}
									userId={agentId} // CHANGED: pass agentId
									// Pass reloadFlag so the table re-fetches on change
									reloadFlag={reloadFlag}
								/>
							</TabPane>
						</Tabs>
					</div>
				</div>
			</div>
		</AppointmentManagementMainWrapper>
	);
};

export default AppointmentManagementMain;

/* -------------------------------------- */
/*         STYLED COMPONENTS             */
/* -------------------------------------- */
const AppointmentManagementMainWrapper = styled.div`
	min-height: 300px;
	overflow-x: hidden;
	margin-top: 20px;

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
