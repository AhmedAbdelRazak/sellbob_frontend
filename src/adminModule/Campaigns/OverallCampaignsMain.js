// AppointmentManagementMain.js

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AdminNavbar from "../AdminNavbar/AdminNavbar";

const OverallCampaignsMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	return (
		<OverallCampaignsMainWrapper>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='OverallCampaigns'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>In Progress....</div>
				</div>
			</div>
		</OverallCampaignsMainWrapper>
	);
};

export default OverallCampaignsMain;

/* -------------------------------------- */
/*         STYLED COMPONENTS             */
/* -------------------------------------- */
const OverallCampaignsMainWrapper = styled.div`
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
