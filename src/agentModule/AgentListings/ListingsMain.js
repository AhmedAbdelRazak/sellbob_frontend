/** @format */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useHistory } from "react-router-dom";

import AdminNavbar from "../AgentNavbar/AgentNavbar";

import AddPropertyModal from "./AddPropertyModal";
import UpdatePropertyModal from "./UpdatePropertyModal";

import { isAuthenticated } from "../../auth";
import { gettingAgentProperties } from "../apiAgent";

import AgentPropertiesList from "./AgentPropertiesList";

const ListingsMain = ({ chosenLanguage }) => {
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	// Grab user + token from isAuthenticated
	const auth = isAuthenticated() || {};
	const { user, token } = auth;

	// We need to figure out the 'agentId' to use:
	const location = useLocation();
	const history = useHistory();
	const [agentId, setAgentId] = useState("");

	// Modals
	const [isModalOpen, setIsModalOpen] = useState(false); // Add
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Update

	// List of properties
	const [agentProperties, setAgentProperties] = useState([]);
	// The property to edit
	const [selectedProperty, setSelectedProperty] = useState(null);

	// Search
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	// 1) On mount, figure out the "agent" param from the URL
	//    If none, default to user._id if available
	useEffect(() => {
		if (!user || !token) return; // not logged in

		const searchParams = new URLSearchParams(location.search);
		if (searchParams.has("agent")) {
			// If the query param 'agent' already exists, use that
			const existingAgent = searchParams.get("agent");
			setAgentId(existingAgent);
		} else {
			// No 'agent' param => fallback to user._id
			const fallbackAgent = user._id || "";
			searchParams.set("agent", fallbackAgent);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
			setAgentId(fallbackAgent);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, token, location]);

	// 2) Once we have a valid agentId, fetch that agent’s properties
	useEffect(() => {
		if (!token || !agentId) return;

		// fetch agent properties for that ID
		gettingAgentProperties(agentId, token)
			.then((data) => {
				if (data && !data.error) {
					setAgentProperties(data);
				} else {
					console.log("Error fetching agent properties:", data?.error);
				}
			})
			.catch((err) => {
				console.error("Error in gettingAgentProperties:", err);
			});
	}, [agentId, token]);

	// Filter by searchTerm
	const getFilteredProperties = () => {
		if (!searchTerm.trim()) return agentProperties;
		const lowerSearch = searchTerm.toLowerCase();

		return agentProperties.filter((prop) => {
			const nameMatch = prop.propertyName?.toLowerCase().includes(lowerSearch);
			const stateMatch = prop.propertyState
				?.toLowerCase()
				.includes(lowerSearch);
			const cityMatch = prop.propertyCity?.toLowerCase().includes(lowerSearch);

			return nameMatch || stateMatch || cityMatch;
		});
	};
	const filteredProperties = getFilteredProperties();

	// Handlers for Add
	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	// Handlers for Update
	const openUpdateModal = (prop) => {
		setSelectedProperty(prop);
		setIsUpdateModalOpen(true);
	};
	const closeUpdateModal = () => {
		setSelectedProperty(null);
		setIsUpdateModalOpen(false);
	};

	// Once property is updated, we can merge the new data into local
	const handlePropertyUpdated = (updatedProp) => {
		setAgentProperties((prev) =>
			prev.map((p) => (p._id === updatedProp._id ? updatedProp : p))
		);
		closeUpdateModal();
	};

	return (
		<ListingsMainWrapper
			dir={chosenLanguage === "Arabic" ? "rtl" : "ltr"}
			show={collapsed}
		>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='Listings'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
						chosenLanguage={chosenLanguage}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<HeaderRow>
							<Title>My Property Listings</Title>
							<ButtonAdd onClick={openModal}>+ Add New Property</ButtonAdd>
						</HeaderRow>

						<SearchWrapper>
							<SearchLabel>Search:</SearchLabel>
							<SearchInput
								type='text'
								placeholder='Filter by name, state, or city...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</SearchWrapper>

						<p>
							Below are all of{" "}
							<strong>{agentId === user?._id ? "Your" : "the Agent's"}</strong>{" "}
							properties. You can click “Add New Property” to create more, or{" "}
							<strong>click on any row</strong> to edit.
						</p>

						{/* Table of agent properties (filtered) */}
						<AgentPropertiesList
							properties={filteredProperties}
							onPropertyClick={openUpdateModal} // pass the clicked prop
						/>

						{/* Add Property Modal */}
						<AddPropertyModal
							visible={isModalOpen}
							onCancel={closeModal}
							onPropertyCreated={(newProp) => {
								// Insert newly created property into local list
								setAgentProperties((prev) => [...prev, newProp]);
							}}
						/>

						{/* Update Property Modal */}
						{selectedProperty && (
							<UpdatePropertyModal
								visible={isUpdateModalOpen}
								onCancel={closeUpdateModal}
								property={selectedProperty}
								onPropertyUpdated={handlePropertyUpdated}
							/>
						)}
					</div>
				</div>
			</div>
		</ListingsMainWrapper>
	);
};

export default ListingsMain;

/* -------------------------------------- */
/*          STYLED COMPONENTS            */
/* -------------------------------------- */

const ListingsMainWrapper = styled.div`
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
	}
`;

const HeaderRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
`;

const Title = styled.h3`
	color: var(--primary-color-dark);
	margin: 0;
`;

const ButtonAdd = styled.button`
	background: var(--button-bg-primary);
	color: var(--button-font-color);
	font-weight: 600;
	padding: 0.6rem 1.2rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	transition: var(--main-transition);
	font-size: 1rem;

	&:hover {
		background: var(--primary-color-light);
	}

	&:active {
		transform: scale(0.98);
	}
`;

const SearchWrapper = styled.div`
	margin: 1rem 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const SearchLabel = styled.label`
	font-weight: 600;
	color: var(--text-color-dark);
`;

const SearchInput = styled.input`
	border: 1px solid var(--border-color-light);
	border-radius: 4px;
	padding: 0.5rem 1rem;
	font-size: 0.95rem;
	transition: var(--main-transition);
	width: 100%;
	max-width: 300px;

	&:focus {
		outline: none;
		border-color: var(--primary-color-light);
	}
`;
