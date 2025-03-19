import React, { useEffect, useState } from "react";
import AdminNavbar from "../AgentNavbar/AgentNavbar";
import styled from "styled-components";
import AgentSummary from "./AgentSummary";

const AgentDashboardMain = ({ chosenLanguage }) => {
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	// Initial setup
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	return (
		<AgentDashboardMainWrapper
			dir={chosenLanguage === "Arabic" ? "rtl" : "ltr"}
			show={collapsed}
		>
			{/* Content Rendering */}
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='AdminDasboard'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
						chosenLanguage={chosenLanguage}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<AgentSummary />
					</div>
				</div>
			</div>
		</AgentDashboardMainWrapper>
	);
};

export default AgentDashboardMain;

const AgentDashboardMainWrapper = styled.div`
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
		background: white;
		margin: 0px 10px;
	}

	@media (max-width: 1400px) {
		background: white;
	}
`;
