/** @format */
// src/pages/AgentPublicPage.jsx

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Spin, message } from "antd";
import { useParams } from "react-router-dom";

import AgentPublicPageDetails from "../components/AgentPuplicPage/AgentPublicPageDetails";
import AgentDetails from "../components/AgentPuplicPage/AgentDetails";

const AgentPublicPage = () => {
	const { agentId } = useParams();
	const [agentProperties, setAgentProperties] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!agentId) return;

		const fetchAgentProperties = async () => {
			try {
				const url = `${process.env.REACT_APP_API_URL}/property/list-of-agent-properties-active-public-page/${agentId}`;
				const response = await fetch(url, { method: "GET" });
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch properties");
				}
				const data = await response.json();
				setAgentProperties(data);
			} catch (err) {
				console.error("Error fetching agent properties:", err);
				message.error(err.message || "Error fetching agent properties");
			} finally {
				setLoading(false);
			}
		};

		fetchAgentProperties();
	}, [agentId]);

	if (loading) {
		return (
			<SpinnerWrapper>
				<Spin size='large' tip='Loading properties...' />
			</SpinnerWrapper>
		);
	}

	// If we have at least one property, we can get the agent from the first property:
	const agent = agentProperties[0]?.belongsTo || null;

	return (
		<AgentPublicPageWrapper>
			{/* Pass the agent to AgentDetails */}
			{agent && <AgentDetails agent={agent} />}

			{/* Pass the array of properties to the listing component */}
			<h2 className='text-center mb-4'>{agent.name}'s Active Properties</h2>
			<AgentPublicPageDetails properties={agentProperties} />
		</AgentPublicPageWrapper>
	);
};

export default AgentPublicPage;

/* ---------------- Styled ------------------ */
const AgentPublicPageWrapper = styled.div`
	min-height: 1000px;
	margin-bottom: 50px;

	.text-center {
		font-weight: bold;
	}
`;

const SpinnerWrapper = styled.div`
	min-height: 600px;
	display: flex;
	align-items: center;
	justify-content: center;
`;
