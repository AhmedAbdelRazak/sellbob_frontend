/** @format */
// AgentDashboardMain.js

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useLocation, useHistory } from "react-router-dom";

import AgentNavbar from "../AgentNavbar/AgentNavbar";
import { gettingPropertiesForAgent } from "../apiAgent";
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

// Sub-components
import DayOverDayViews from "./DayOverDayViews";
import PropertiesDetails from "./PropertiesDetails";
import AppointmentsOverview from "./AppointmentsOverview";
import ActiveLeadsOverview from "./ActiveLeadsOverview";
import WishListOverview from "./WishListOverview";

/** We define this array outside the component
 *  so it never changes (no need to add it to dependency arrays).
 */
const VALID_KPIS = [
	"propertyCount",
	"overallViews",
	"appointments",
	"activeLeads",
	"wishlists",
];

const AgentDashboardMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	// The response shape => { top3:[], tableData:[], pagination:{...}, overallWishlists }
	const [agentData, setAgentData] = useState({
		tableData: [],
		pagination: { page: 1, limit: 20, total: 0, pages: 1 },
		overallWishlists: 0,
		top3: [],
		// If you want top3 or other fields, you can keep them here
	});

	// Grab user + token
	const { user, token } = isAuthenticated() || {};

	// For reading & updating the query param that tracks which KPI is active
	const location = useLocation();
	const history = useHistory();

	// We'll read an `agent` param if present, else default to user._id
	const [agentId, setAgentId] = useState("");

	// Default KPI is "propertyCount"
	const [activeKPI, setActiveKPI] = useState("propertyCount");

	// Collapse if window <= 1000 => run once on mount
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	/**
	 * Parse query params for:
	 * - agent => if none, fallback to user._id
	 * - kpi => must be in VALID_KPIS
	 *
	 * Only run this if user/token or the location changes in a meaningful way.
	 */
	useEffect(() => {
		if (!user || !token) return; // skip if not logged in

		const searchParams = new URLSearchParams(location.search);

		// 1) Agent param
		if (searchParams.has("agent")) {
			setAgentId(searchParams.get("agent") || "");
		} else {
			const fallbackAgent = user._id || "";
			searchParams.set("agent", fallbackAgent);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
			setAgentId(fallbackAgent);
		}

		// 2) KPI param
		const kpiParam = searchParams.get("kpi");
		if (kpiParam && VALID_KPIS.includes(kpiParam)) {
			setActiveKPI(kpiParam);
		} else {
			// or fallback if needed
			setActiveKPI("propertyCount");
		}
	}, [user, token, location.pathname, location.search, history]);

	/**
	 * Fetch properties for the given agent once we know agentId & token
	 */
	useEffect(() => {
		if (!agentId || !token) return;

		// e.g. query => { page:1, limit:20 }
		const query = { page: 1, limit: 20 };

		gettingPropertiesForAgent(agentId, token, query)
			.then((data) => {
				if (data && !data.error) {
					setAgentData(data);
				} else if (data?.error) {
					console.error("Error fetching agent data:", data.error);
				}
			})
			.catch((err) => {
				console.error("Fetch agent data error:", err);
			});
	}, [agentId, token]);

	// Destructure the relevant fields from agentData
	const { tableData, pagination, overallWishlists, top3 } = agentData;

	// ========== KPI Calculations ==========
	// 1) Property Count
	const propertyCount = tableData.length;

	// 2) Overall Views
	const overallViews = tableData.reduce(
		(sum, row) => sum + (row.views || 0),
		0
	);

	// 3) Appointments => Flatten them
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

	// 4) Active Leads
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

	/**
	 * Handle user clicking a KPI card
	 * => sets activeKPI => updates query param
	 */
	const handleKpiClick = (kpiKey) => {
		setActiveKPI(kpiKey);
		const searchParams = new URLSearchParams(location.search);
		searchParams.set("kpi", kpiKey);
		history.push({
			pathname: location.pathname,
			search: searchParams.toString(),
		});
	};

	return (
		<AgentDashboardMainWrapper show={collapsed}>
			<div className='grid-container-main'>
				{/* Left Sidebar Nav */}
				<div className='navcontent'>
					<AgentNavbar
						fromPage='AgentDashboard'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				{/* Main Content */}
				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						{/* KPI Cards */}
						<KpiCardsWrapper>
							{/* 1) Property Count */}
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

							{/* 2) Overall Views */}
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

							{/* 3) Appointments */}
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

						{/* Render Sub-Components by KPI */}
						{activeKPI === "propertyCount" && (
							<PropertiesDetails
								pagination={pagination}
								tableData={tableData}
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
						{tableData &&
							tableData.length > 0 &&
							activeKPI === "overallViews" && (
								<DayOverDayViews tableData={tableData} />
							)}
					</div>
				</div>
			</div>
		</AgentDashboardMainWrapper>
	);
};

export default AgentDashboardMain;

/* ---------------------- STYLED COMPONENTS ---------------------- */
const AgentDashboardMainWrapper = styled.div`
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
	transition: var(--mainTransition);

	&:hover {
		padding: 1.1rem;
		box-shadow: var(--box-shadow-dark);
	}

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
