import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Spin, message } from "antd";
import OurPropertiesDetails from "../components/OurProperties/OurPropertiesDetails";
import FilterBar from "../components/Global/FilterBar";
import { useCartContext } from "../cart_context";
import { useLocation, useHistory } from "react-router-dom"; // <-- note useHistory for v5

const OurProperties = () => {
	const [loading, setLoading] = useState(true);
	const [filteredProperties, setFilteredProperties] = useState([]);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1 });
	const { activeStatesAndCities } = useCartContext();

	// React Router v5 hooks
	const location = useLocation();
	const history = useHistory();

	// 1) Fetch the properties whenever the URL query string changes
	const fetchFilteredProperties = async () => {
		try {
			setLoading(true);

			const params = new URLSearchParams(location.search);
			const countryParam = params.get("country") || "";
			const stateParam = params.get("state") || "";
			const cityParam = params.get("city") || "";
			const pageParam = parseInt(params.get("page") || "1", 10);

			// Build query for the backend
			const queryParams = new URLSearchParams();
			if (countryParam) queryParams.append("country", countryParam);
			if (stateParam) queryParams.append("state", stateParam);
			if (cityParam) queryParams.append("city", cityParam);
			queryParams.append("page", pageParam);
			queryParams.append("limit", 20);

			const url = `${process.env.REACT_APP_API_URL}/list-of-filtered-properties?${queryParams.toString()}`;

			const response = await fetch(url);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to fetch properties");
			}

			// Expected shape:
			// { data: [...], page: number, totalPages: number, ... }
			const data = await response.json();
			setFilteredProperties(data.data || []);
			setPageInfo({
				page: data.page || 1,
				totalPages: data.totalPages || 1,
			});
		} catch (err) {
			console.error("Error fetching filtered properties:", err);
			message.error(err.message || "Error fetching filtered properties");
		} finally {
			setLoading(false);
		}
	};

	// 2) Run fetch each time location.search changes (single-page approach)
	useEffect(() => {
		fetchFilteredProperties();
		// eslint-disable-next-line
	}, [location.search]);

	// 3) Example for "Next Page" without a full reload
	const handleNextPage = () => {
		const params = new URLSearchParams(location.search);
		const currentPage = parseInt(params.get("page") || "1", 10);

		params.set("page", currentPage + 1);
		// In React Router v5, use history.push instead of navigate
		history.push({
			pathname: "/properties",
			search: params.toString(),
		});
	};

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

			{/* FilterBar uses history.push as well, so no full reload on search */}
			<FilterBar activeStatesAndCities={activeStatesAndCities} />

			<OurPropertiesDetails properties={filteredProperties} />

			<PaginationContainer>
				<p>
					Page {pageInfo.page} of {pageInfo.totalPages}
				</p>
				{pageInfo.page < pageInfo.totalPages && (
					<button onClick={handleNextPage}>Next Page</button>
				)}
			</PaginationContainer>
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

const PaginationContainer = styled.div`
	margin-top: 2rem;
	text-align: center;

	button {
		margin-left: 1rem;
		padding: 0.5rem 1rem;
		background-color: var(--button-bg-primary);
		color: var(--button-font-color);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: var(--main-transition);

		&:hover {
			background-color: var(--button-bg-primary-light);
		}
	}
`;
