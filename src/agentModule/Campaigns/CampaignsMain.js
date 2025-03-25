// AppointmentManagementMain.js

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AdminNavbar from "../AgentNavbar/AgentNavbar";

const CampaignsMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	return (
		<CampaignsMainWrapper>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='Campaigns'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						No Campaigns Are Assigned To Your Account Yet...
					</div>
				</div>
			</div>
		</CampaignsMainWrapper>
	);
};

export default CampaignsMain;

/* -------------------------------------- */
/*         STYLED COMPONENTS             */
/* -------------------------------------- */
const CampaignsMainWrapper = styled.div`
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
