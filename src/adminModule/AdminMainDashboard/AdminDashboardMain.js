import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import {
	gettingPropertiesForAdmin,
	updatePropertyStatus,
	updatePropertyFeatured,
} from "../apiAdmin";
import { isAuthenticated } from "../../auth";

import { FaHome, FaEye, FaCalendarCheck, FaUserFriends } from "react-icons/fa";
import CountUp from "react-countup";
import { Button, Input, Modal, message } from "antd";
import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const AdminDashboardMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	// Entire response from server: { top3, tableData, pagination }
	const [adminData, setAdminData] = useState({
		top3: [],
		tableData: [],
		pagination: { page: 1, limit: 20, total: 0, pages: 1 },
	});

	// local states for search & filters
	const [searchValue, setSearchValue] = useState("");
	// null => no filter, "true" => only active, "false" => only inactive
	const [activeFilter, setActiveFilter] = useState(null);
	// null => no filter, "true" => only featured, "false" => only not featured
	const [featuredFilter, setFeaturedFilter] = useState(null);

	const { user, token } = isAuthenticated();

	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
		// 1) Clear any previous agentId, propertyId from localStorage on mount
		localStorage.removeItem("agentId");
		localStorage.removeItem("propertyId");

		// 2) initial fetch: no filters
		fetchAdminData(1, null, null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Fetch admin data with optional overrides for "active" and "featured".
	 */
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
	const { top3, tableData, pagination } = adminData;

	// KPI from tableData
	const propertyCount = tableData.length;
	const overallViews = tableData.reduce(
		(sum, row) => sum + (row.views || 0),
		0
	);
	const upcomingAppointments = 0;
	const activeLeads = 0;

	/* -------------- Search Handlers -------------- */
	const handleSearchChange = (e) => {
		setSearchValue(e.target.value);
	};
	const handleSearchEnter = (e) => {
		if (e.key === "Enter") {
			// fetch again with current filters
			fetchAdminData(1, activeFilter, featuredFilter);
		}
	};
	const handleSearchButton = () => {
		fetchAdminData(1, activeFilter, featuredFilter);
	};

	/* -------------- Filter Handlers: Active -------------- */
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

	/* -------------- Filter Handlers: Featured -------------- */
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

	/* -------------- Clear ALL (Active + Featured + Search) -------------- */
	const handleClearAll = () => {
		setActiveFilter(null);
		setFeaturedFilter(null);
		setSearchValue("");
		fetchAdminData(1, null, null);
	};

	/* -------------- Update Status Handler -------------- */
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

	/* -------------- Update Featured Handler -------------- */
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

	/* -------------- Row Click => store agent & property in localStorage -------------- */
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
							<KpiCard>
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

							<KpiCard>
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

							<KpiCard>
								<IconWrapper
									style={{ backgroundColor: "var(--primary-color-dark)" }}
								>
									<FaCalendarCheck size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Upcoming Appointments</KpiTitle>
									<KpiValue>
										<CountUp end={upcomingAppointments} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>

							<KpiCard>
								<IconWrapper style={{ backgroundColor: "var(--orangeDark)" }}>
									<FaUserFriends size={24} color='#fff' />
								</IconWrapper>
								<KpiInfo>
									<KpiTitle>Active Leads</KpiTitle>
									<KpiValue>
										<CountUp end={activeLeads} duration={1.5} />
									</KpiValue>
								</KpiInfo>
							</KpiCard>
						</KpiCardsWrapper>

						{/* Top 3 */}
						<Top3Wrapper>
							<SectionTitle>Top 3 Viewed Properties</SectionTitle>
							{top3 && top3.length > 0 ? (
								<ul>
									{top3.map((item, idx) => (
										<li key={idx}>
											{item.name || "Untitled"} — {item.views} views
										</li>
									))}
								</ul>
							) : (
								<p>No properties found.</p>
							)}
						</Top3Wrapper>

						{/* Search & Filter */}
						<SearchFilterWrapper>
							<div className='filterRowsContainer'>
								{/* Row 1: Search + Clear All */}
								<div className='filterRow'>
									<Input
										placeholder='Search user or property...'
										prefix={<SearchOutlined />}
										value={searchValue}
										onChange={handleSearchChange}
										onKeyPress={handleSearchEnter}
										style={{ width: 300 }}
									/>
									<Button type='primary' onClick={handleSearchButton}>
										Search
									</Button>
									<Button danger onClick={handleClearAll}>
										Clear All
									</Button>
								</div>

								{/* Row 2: Active / Inactive */}
								<div className='filterRow'>
									<Button
										type={activeFilter === "true" ? "primary" : "default"}
										onClick={handleFilterActive}
									>
										Active
									</Button>
									<Button
										type={activeFilter === "false" ? "primary" : "default"}
										onClick={handleFilterInactive}
									>
										Inactive
									</Button>
									<Button
										type={activeFilter === null ? "primary" : "default"}
										onClick={handleClearActive}
									>
										Clear Active
									</Button>
								</div>

								{/* Row 3: Featured / Not Featured */}
								<div className='filterRow'>
									<Button
										type={featuredFilter === "true" ? "primary" : "default"}
										onClick={handleFilterFeatured}
									>
										Featured
									</Button>
									<Button
										type={featuredFilter === "false" ? "primary" : "default"}
										onClick={handleFilterNotFeatured}
									>
										Not Featured
									</Button>
									<Button
										type={featuredFilter === null ? "primary" : "default"}
										onClick={handleClearFeatured}
									>
										Clear Featured
									</Button>
								</div>
							</div>
						</SearchFilterWrapper>

						{/* Table */}
						<SectionTitle>All Agents & Properties</SectionTitle>
						<TableWrapper>
							<table className='myStyledTable'>
								<thead>
									<tr>
										<th style={{ width: "40px" }}>#</th>
										<th>Owner Name</th>
										<th>Email / Phone</th>
										<th>Property</th>
										<th>Location</th>
										<th>Views</th>
										<th>Status</th>
										<th>Active?</th>
										<th>Featured?</th>
										<th>Price</th>
									</tr>
								</thead>
								<tbody>
									{tableData && tableData.length > 0 ? (
										tableData.map((row, idx) => (
											<tr
												key={row.key}
												onClick={() => handleRowClick(row)}
												style={{ cursor: "pointer" }}
											>
												<td>{idx + 1}</td>
												<td>{row.ownerName}</td>
												<td>
													{row.ownerEmail}
													{row.ownerPhone ? ` | ${row.ownerPhone}` : ""}
												</td>
												<td>{row.property}</td>
												<td>{row.location}</td>
												<td>{row.views}</td>
												<td>{row.status}</td>
												<td>
													<span
														style={{
															padding: "3px 8px",
															borderRadius: "4px",
															backgroundColor: row.activeProperty
																? "#d4edda"
																: "#f8d7da",
															color: row.activeProperty ? "#155724" : "#721c24",
															fontWeight: "bold",
															cursor: "pointer",
														}}
														onClick={(e) => handleClickActive(e, row)}
													>
														{row.activeProperty ? "Active" : "Inactive"}
													</span>
												</td>
												<td>
													<span
														style={{
															padding: "3px 8px",
															borderRadius: "4px",
															backgroundColor: row.featured
																? "#c2f8c2"
																: "#d1ecf1",
															color: row.featured ? "#155724" : "#0c5460",
															fontWeight: "bold",
															cursor: "pointer",
														}}
														onClick={(e) => handleClickFeatured(e, row)}
													>
														{row.featured ? "Featured" : "Not Featured"}
													</span>
												</td>
												<td>{row.price}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={10}>
												<em>No data found.</em>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</TableWrapper>

						{/* Pagination */}
						<PaginationInfo>
							<p>
								Page: {pagination.page} / {pagination.pages} &nbsp; |
								&nbsp;Total: {pagination.total} rows
							</p>
						</PaginationInfo>
					</div>
				</div>
			</div>
		</AdminDashboardMainWrapper>
	);
};

export default AdminDashboardMain;

/* ---------- Styled Components ---------- */
const AdminDashboardMainWrapper = styled.div`
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

	ul {
		list-style: none;
		text-transform: capitalize;
	}
`;

const SearchFilterWrapper = styled.div`
	margin-bottom: 20px;

	/* Center all rows at same max-width */
	.filterRowsContainer {
		max-width: 700px; /* adjust as you like */
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 15px;
		border: 1px lightgray solid;
		padding: 10px;
		border-radius: 10px;
	}

	button {
		font-size: 0.8rem;
		font-weight: bold;
	}

	.filterRow {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}
`;

const KpiCardsWrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

const Top3Wrapper = styled.div`
	margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
	font-size: 1.2rem;
	color: var(--text-color-dark);
	margin-bottom: 0.75rem;
	font-weight: 600;
`;

const TableWrapper = styled.div`
	margin-top: 1rem;

	.myStyledTable {
		width: 100%;
		border-collapse: collapse;
		background: var(--mainWhite);
		color: var(--text-color-dark);
		font-size: 0.8rem;

		thead {
			background: var(--neutral-light2);
			tr th {
				padding: 0.75rem;
				border: 1px solid var(--border-color-light);
				text-align: left;
				font-weight: bold;
			}
		}

		tbody {
			tr {
				border-bottom: 1px solid var(--border-color-light);
				transition: var(--main-transition);

				&:hover {
					background: var(--neutral-light3);
				}

				td {
					padding: 0.75rem;
					border: 1px solid var(--border-color-light);
					vertical-align: middle;
				}
			}
		}
	}
`;

const PaginationInfo = styled.div`
	margin-top: 1rem;
	font-size: 0.9rem;
	color: var(--text-color-secondary);
`;
