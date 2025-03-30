/** @format */
// AdminDashboardMain.js

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useLocation, useHistory } from "react-router-dom";

import AdminNavbar from "../AdminNavbar/AdminNavbar";
import {
	gettingPropertiesForAdmin,
	updatePropertyStatus,
	updatePropertyFeatured,
} from "../apiAdmin";
import { isAuthenticated } from "../../auth";

// Icons
import {
	FaHome,
	FaEye,
	FaCalendarCheck,
	FaUserFriends,
	FaHeart,
} from "react-icons/fa";
import CountUp from "react-countup";
import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// Sub-components
import DayOverDayViews from "./DayOverDayViews";
import PropertiesDetails from "./PropertiesDetails";
import AppointmentsOverview from "./AppointmentsOverview";
import ActiveLeadsOverview from "./ActiveLeadsOverview";
import WishListOverview from "./WishListOverview";

const { confirm } = Modal;

const AdminDashboardMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	// The server response shape: { top3, tableData, pagination, overallWishlists }
	const [adminData, setAdminData] = useState({
		top3: [],
		tableData: [],
		pagination: { page: 1, limit: 20, total: 0, pages: 1 },
		overallWishlists: 0,
	});

	// local states for search & filters
	const [searchValue, setSearchValue] = useState("");
	const [activeFilter, setActiveFilter] = useState(null); // 'true' or 'false' or null
	const [featuredFilter, setFeaturedFilter] = useState(null); // 'true' or 'false' or null

	const { user, token } = isAuthenticated();

	// For reading & updating the query param that tracks which KPI is active
	const location = useLocation();
	const history = useHistory();

	const validKPIs = [
		"propertyCount",
		"overallViews",
		"appointments",
		"activeLeads",
		"wishlists",
	];

	// Default KPI is "propertyCount"
	const [activeKPI, setActiveKPI] = useState("propertyCount");

	// On mount, handle small screen collapse + set activeKPI from URL
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
		// Clear any previous agentId, propertyId from localStorage on mount
		localStorage.removeItem("agentId");
		localStorage.removeItem("propertyId");

		// Check if there's a ?kpi= param
		const searchParams = new URLSearchParams(location.search);
		const kpiParam = searchParams.get("kpi");
		if (kpiParam && validKPIs.includes(kpiParam)) {
			setActiveKPI(kpiParam);
		} else {
			// default to propertyCount
			setActiveKPI("propertyCount");
		}

		// initial fetch: no filters
		fetchAdminData(1, null, null);
		// eslint-disable-next-line
	}, []);

	// Core fetch function
	const fetchAdminData = (
		overridePage = 1,
		overrideActive = activeFilter,
		overrideFeatured = featuredFilter
	) => {
		const query = {
			page: overridePage,
			limit: 20,
		};

		if (searchValue.trim()) {
			query.search = searchValue.trim();
		}
		if (overrideActive !== null) {
			query.active = overrideActive; // "true" or "false"
		}
		if (overrideFeatured !== null) {
			query.featured = overrideFeatured; // "true" or "false"
		}

		gettingPropertiesForAdmin(user._id, token, query)
			.then((data) => {
				if (data && !data.error) {
					setAdminData(data);
				} else if (data && data.error) {
					console.error("Error fetching admin data:", data.error);
				}
			})
			.catch((err) => console.error("Fetch admin data error:", err));
	};

	// destructure from adminData
	const { top3, tableData, pagination, overallWishlists } = adminData;

	// 1) Property Count
	const propertyCount = tableData.length;

	// 2) Overall Views
	const overallViews = tableData.reduce(
		(sum, row) => sum + (row.views || 0),
		0
	);

	// 3) Appointments => Flatten them from appointmentsBreakdown
	const appointmentsCount = useMemo(() => {
		let allAppointments = [];
		tableData.forEach((row) => {
			const breakdown = row.appointmentsBreakdown;
			if (!breakdown) return;
			const { upcoming = [], today = [], last7Days = [] } = breakdown;
			allAppointments.push(...upcoming, ...today, ...last7Days);
		});
		return allAppointments.length;
	}, [tableData]);

	// 4) Active Leads => from the logic in ActiveLeadsOverview
	const totalActiveLeads = useMemo(() => {
		let arr = [];
		tableData.forEach((row) => {
			const owner = (row.ownerName || "").toLowerCase().trim();
			const leads = row.activeLeads || [];

			leads.forEach((lead) => {
				const leadName = (lead.name || "").toLowerCase().trim();
				// skip if leadName === ownerName
				if (leadName === owner) return;
				arr.push(lead);
			});
		});
		return arr.length;
	}, [tableData]);

	// ----------------- Query Param for KPI -----------------
	const handleKpiClick = (kpiKey) => {
		setActiveKPI(kpiKey);
		const searchParams = new URLSearchParams(location.search);
		searchParams.set("kpi", kpiKey);
		history.push({
			pathname: location.pathname,
			search: searchParams.toString(),
		});
	};

	// ----------------- Search Handlers -----------------
	const handleSearchChange = (e) => {
		setSearchValue(e.target.value);
	};
	const handleSearchEnter = (e) => {
		if (e.key === "Enter") {
			fetchAdminData(1, activeFilter, featuredFilter);
		}
	};
	const handleSearchButton = () => {
		fetchAdminData(1, activeFilter, featuredFilter);
	};

	// ----------------- Filter Handlers: Active -----------------
	const handleFilterActive = () => {
		setActiveFilter("true");
		fetchAdminData(1, "true", featuredFilter);
	};
	const handleFilterInactive = () => {
		setActiveFilter("false");
		fetchAdminData(1, "false", featuredFilter);
	};
	const handleClearActive = () => {
		setActiveFilter(null);
		fetchAdminData(1, null, featuredFilter);
	};

	// ----------------- Filter Handlers: Featured -----------------
	const handleFilterFeatured = () => {
		setFeaturedFilter("true");
		fetchAdminData(1, activeFilter, "true");
	};
	const handleFilterNotFeatured = () => {
		setFeaturedFilter("false");
		fetchAdminData(1, activeFilter, "false");
	};
	const handleClearFeatured = () => {
		setFeaturedFilter(null);
		fetchAdminData(1, activeFilter, null);
	};

	// ----------------- Clear ALL (Active + Featured + Search) -----------------
	const handleClearAll = () => {
		setActiveFilter(null);
		setFeaturedFilter(null);
		setSearchValue("");
		fetchAdminData(1, null, null);
	};

	// ----------------- Update Status Handler -----------------
	const handleClickActive = (e, row) => {
		e.stopPropagation();
		const currentStatus = row.activeProperty === true;
		const propertyId = row.key.replace("p-", "");

		const confirmTitle = currentStatus
			? "Deactivate this property?"
			: "Activate this property?";
		const confirmContent = currentStatus
			? "Are you sure you want to mark this property as Inactive?"
			: "Are you sure you want to mark this property as Active?";

		confirm({
			title: confirmTitle,
			icon: <ExclamationCircleOutlined />,
			content: confirmContent,
			okText: "Yes",
			cancelText: "No",
			onOk: () => {
				const newStatus = !currentStatus;
				updatePropertyStatus(user._id, propertyId, token, newStatus)
					.then((res) => {
						if (res && !res.error) {
							message.success("Property status updated!");
							// refresh with current filters & pagination
							fetchAdminData(pagination.page, activeFilter, featuredFilter);
						} else {
							message.error("Could not update property status");
						}
					})
					.catch((err) => {
						message.error("Failed to update property status");
						console.error(err);
					});
			},
		});
	};

	// ----------------- Update Featured Handler -----------------
	const handleClickFeatured = (e, row) => {
		e.stopPropagation();
		const currentFeatured = row.featured === true;
		const propertyId = row.key.replace("p-", "");

		const confirmTitle = currentFeatured
			? "Remove from featured?"
			: "Mark as featured?";
		const confirmContent = currentFeatured
			? "Are you sure you want to un-feature this property?"
			: "Are you sure you want to feature this property?";

		confirm({
			title: confirmTitle,
			icon: <ExclamationCircleOutlined />,
			content: confirmContent,
			okText: "Yes",
			cancelText: "No",
			onOk: () => {
				const newFeatured = !currentFeatured;
				updatePropertyFeatured(user._id, propertyId, token, newFeatured)
					.then((res) => {
						if (res && !res.error) {
							message.success("Property featured status updated!");
							// refresh with current filters & pagination
							fetchAdminData(pagination.page, activeFilter, featuredFilter);
						} else {
							message.error("Could not update property featured status");
						}
					})
					.catch((err) => {
						message.error("Failed to update property featured status");
						console.error(err);
					});
			},
		});
	};

	// ----------------- Row Click => store agent & property in localStorage -----------------
	const handleRowClick = (row) => {
		const isProperty = row.key.startsWith("p-");
		const propertyId = isProperty ? row.key.substring(2) : "";
		const agentId = row.ownerId || "noOwner";

		localStorage.setItem("agentId", agentId);
		if (propertyId) {
			localStorage.setItem("propertyId", propertyId);
		} else {
			localStorage.removeItem("propertyId");
		}

		// redirect
		window.location.href = `/agent/dashboard?agent=${agentId}${
			propertyId ? `&property=${propertyId}` : ""
		}`;
	};

	// ---------------------------------------------------------
	// Render
	// ---------------------------------------------------------
	return (
		<AdminDashboardMainWrapper show={collapsed}>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='AdminDashboard'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						{/* KPI Cards */}
						<KpiCardsWrapper>
							{/* 1) Property Count Card */}
							<KpiCard
								isActive={activeKPI === "propertyCount"}
								onClick={() => handleKpiClick("propertyCount")}
							>
								<IconWrapper
									style={{ backgroundColor: "var(--primary-color-light)" }}
								>
									<FaHome size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Property Count</KpiTitle>
									<KpiValue>
										<CountUp end={propertyCount} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>

							{/* 2) Overall Views Card */}
							<KpiCard
								isActive={activeKPI === "overallViews"}
								onClick={() => handleKpiClick("overallViews")}
							>
								<IconWrapper
									style={{ backgroundColor: "var(--secondary-color)" }}
								>
									<FaEye size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Overall Views</KpiTitle>
									<KpiValue>
										<CountUp end={overallViews} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>

							{/* 3) Appointments => from appointmentsCount */}
							<KpiCard
								isActive={activeKPI === "appointments"}
								onClick={() => handleKpiClick("appointments")}
							>
								<IconWrapper
									style={{ backgroundColor: "var(--primary-color-dark)" }}
								>
									<FaCalendarCheck size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Appointments</KpiTitle>
									<KpiValue>
										<CountUp end={appointmentsCount} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>

							{/* 4) Active Leads */}
							<KpiCard
								isActive={activeKPI === "activeLeads"}
								onClick={() => handleKpiClick("activeLeads")}
							>
								<IconWrapper style={{ backgroundColor: "var(--orangeDark)" }}>
									<FaUserFriends size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Active Leads</KpiTitle>
									<KpiValue>
										<CountUp end={totalActiveLeads} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>

							{/* 5) Wishlists */}
							<KpiCard
								isActive={activeKPI === "wishlists"}
								onClick={() => handleKpiClick("wishlists")}
							>
								<IconWrapper
									style={{ backgroundColor: "var(--primary-color-dark)" }}
								>
									<FaHeart size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Total Wishlists</KpiTitle>
									<KpiValue>
										<CountUp end={overallWishlists || 0} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>
						</KpiCardsWrapper>

						{/* Conditionally Render the active KPI component */}
						{activeKPI === "propertyCount" && (
							<PropertiesDetails
								handleClearActive={handleClearActive}
								pagination={pagination}
								tableData={tableData}
								handleFilterActive={handleFilterActive}
								handleFilterNotFeatured={handleFilterNotFeatured}
								featuredFilter={featuredFilter}
								searchValue={searchValue}
								handleSearchButton={handleSearchButton}
								handleSearchChange={handleSearchChange}
								handleSearchEnter={handleSearchEnter}
								handleClearAll={handleClearAll}
								activeFilter={activeFilter}
								handleFilterInactive={handleFilterInactive}
								handleRowClick={handleRowClick}
								handleFilterFeatured={handleFilterFeatured}
								handleClearFeatured={handleClearFeatured}
								handleClickActive={handleClickActive}
								handleClickFeatured={handleClickFeatured}
								top3={top3}
							/>
						)}

						{activeKPI === "appointments" && (
							<AppointmentsOverview tableData={tableData} />
						)}

						{activeKPI === "activeLeads" && (
							<ActiveLeadsOverview tableData={tableData} />
						)}

						{activeKPI === "wishlists" && (
							<WishListOverview tableData={tableData} />
						)}

						{/* If no tableData, skip DayOverDayViews */}
						{tableData && tableData.length > 0 && (
							<>
								{activeKPI === "overallViews" && (
									<DayOverDayViews tableData={tableData} />
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</AdminDashboardMainWrapper>
	);
};

export default AdminDashboardMain;

/* ---------------------------------- */
/*           STYLED COMPONENTS        */
/* ---------------------------------- */
const AdminDashboardMainWrapper = styled.div`
	min-height: 300px;
	overflow-x: hidden;
	margin-top: 20px;

	.grid-container-main {
		display: grid;
		grid-template-columns: ${(props) => (props.show ? "5% 75%" : "17% 75%")};
	}

	.container-wrapper {
		border: 2px solid var(--neutral-light3);
		padding: 20px;
		border-radius: 20px;
		background: var(--mainWhite);
		margin: 0px 10px;
		width: 100%;
	}

	ul {
		list-style: none;
		text-transform: capitalize;
	}
`;

const KpiCardsWrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 1rem;
	margin-bottom: 2rem;
`;

const KpiCard = styled.div`
	background: var(--mainWhite);
	display: flex;
	align-items: center;
	border-radius: 8px;
	box-shadow: var(--box-shadow-light);
	padding: 1rem;
	cursor: pointer;
	transition: var(--main-transition);

	/* Hover => slightly increase padding & stronger shadow */
	&:hover {
		padding: 1.1rem; /* subtle increase */
		box-shadow: var(--box-shadow-dark);
	}

	/* If card is active => highlight */
	${(props) =>
		props.isActive &&
		`
      border: 2px solid var(--primaryBlue);
      background: var(--neutral-light);
    `}
`;

const IconWrapper = styled.div`
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: var(--primary-color);
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 1rem;
`;

const KpiInfo = styled.div`
	display: flex;
	flex-direction: column;
`;

const KpiTitle = styled.span`
	font-size: 0.9rem;
	color: var(--text-color-secondary);
	margin-bottom: 0.25rem;
`;

const KpiValue = styled.span`
	font-size: 1.4rem;
	font-weight: bold;
	color: var(--text-color-dark);
`;
