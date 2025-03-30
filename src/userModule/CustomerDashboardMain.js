/** @format */
// CustomerDashboardMain.js

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CustomerDashboardDetails from "../components/CustomerDashboard/CustomerDashboardDetails";
import { isAuthenticated } from "../auth";
import { getUserDetails } from "../apiCore"; // or wherever your getUserDetails is

const CustomerDashboardMain = () => {
	const [userDetails, setUserDetails] = useState("");
	const { user, token } = isAuthenticated();

	const gettingUserDetails = () => {
		getUserDetails(user._id, token).then((data) => {
			if (data && data.error) {
				console.log("Error fetching user details:", data.error);
			} else {
				setUserDetails(data);
			}
		});
	};

	useEffect(() => {
		gettingUserDetails();
		// eslint-disable-next-line
	}, []);

	return (
		<CustomerDashboardMainWrapper>
			<CustomerDashboardDetails userDetails={userDetails} />
		</CustomerDashboardMainWrapper>
	);
};

export default CustomerDashboardMain;

const CustomerDashboardMainWrapper = styled.div`
	min-height: 800px;
	margin-bottom: 50px;
`;
