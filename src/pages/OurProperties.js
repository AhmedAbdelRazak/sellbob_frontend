import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Spin, message } from "antd";
import OurPropertiesDetails from "../components/OurProperties/OurPropertiesDetails";

const OurProperties = () => {
	const [loading, setLoading] = useState(true);
	const [filteredProperties, setFilteredProperties] = useState([]);

	useEffect(() => {
		const fetchFilteredProperties = async () => {
			try {
				const url = `${process.env.REACT_APP_API_URL}/list-of-filtered-properties`;
				const response = await fetch(url, { method: "GET" });
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch properties");
				}
				const data = await response.json();
				setFilteredProperties(data);
			} catch (err) {
				console.error("Error fetching filtered properties:", err);
				message.error(err.message || "Error fetching filtered properties");
			} finally {
				setLoading(false);
			}
		};

		fetchFilteredProperties();
	}, []);

	if (loading) {
		return (
			<SpinnerWrapper>
				<Spin size='large' tip='Loading properties...' />
			</SpinnerWrapper>
		);
	}

	return (
		<OurPropertiesWrapper>
			<h2 className='text-center mb-4'>SELLBOB Properties</h2>
			<OurPropertiesDetails properties={filteredProperties} />
		</OurPropertiesWrapper>
	);
};

export default OurProperties;

/* ---------------- Styled ------------------ */
const OurPropertiesWrapper = styled.div`
	min-height: 1000px;
	margin-bottom: 50px;
	margin-top: 50px;

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
