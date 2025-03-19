import React from "react";
import styled from "styled-components";
import { Table } from "antd";
import CountUp from "react-countup";
import { FaHome, FaEye, FaCalendarCheck, FaUserFriends } from "react-icons/fa";

const AgentSummary = () => {
	// Hardcoded data for top 3 viewed properties
	const top3Properties = [
		{ name: "Property A", views: 30 },
		{ name: "Property B", views: 27 },
		{ name: "Property C", views: 25 },
	];

	// Hardcoded table data for properties
	const columns = [
		{
			title: "Property",
			dataIndex: "property",
			key: "property",
			width: "20%",
		},
		{
			title: "Location",
			dataIndex: "location",
			key: "location",
			width: "20%",
		},
		{
			title: "Views",
			dataIndex: "views",
			key: "views",
			width: "15%",
		},
		{
			title: "Appointments",
			dataIndex: "appointments",
			key: "appointments",
			width: "15%",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: "15%",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			width: "15%",
		},
	];

	const dataSource = [
		{
			key: "1",
			property: "Downtown Duplex",
			location: "New York, USA",
			views: 45,
			appointments: 2,
			status: "Active",
			price: "$500,000",
		},
		{
			key: "2",
			property: "Modern Condo",
			location: "Los Angeles, USA",
			views: 28,
			appointments: 1,
			status: "Pending",
			price: "$350,000",
		},
		{
			key: "3",
			property: "Beach House",
			location: "Miami, USA",
			views: 62,
			appointments: 5,
			status: "Active",
			price: "$750,000",
		},
		{
			key: "4",
			property: "City Apartment",
			location: "Chicago, USA",
			views: 18,
			appointments: 0,
			status: "Active",
			price: "$450,000",
		},
	];

	return (
		<AgentSummaryWrapper>
			<KpiCardsWrapper>
				{/* KPI Card 1: Property Count */}
				<KpiCard>
					<IconWrapper
						style={{ backgroundColor: "var(--primary-color-light)" }}
					>
						<FaHome size={24} color='#fff' />
					</IconWrapper>
					<KpiInfo>
						<KpiTitle>Property Count</KpiTitle>
						<KpiValue>
							<CountUp end={5} duration={1.5} />
						</KpiValue>
					</KpiInfo>
				</KpiCard>

				{/* KPI Card 2: Overall Views */}
				<KpiCard>
					<IconWrapper style={{ backgroundColor: "var(--secondary-color)" }}>
						<FaEye size={24} color='#fff' />
					</IconWrapper>
					<KpiInfo>
						<KpiTitle>Overall Views</KpiTitle>
						<KpiValue>
							<CountUp end={150} duration={1.5} />
						</KpiValue>
					</KpiInfo>
				</KpiCard>

				{/* KPI Card 3: Upcoming Appointments */}
				<KpiCard>
					<IconWrapper style={{ backgroundColor: "var(--primary-color-dark)" }}>
						<FaCalendarCheck size={24} color='#fff' />
					</IconWrapper>
					<KpiInfo>
						<KpiTitle>Upcoming Appointments</KpiTitle>
						<KpiValue>
							<CountUp end={3} duration={1.5} />
						</KpiValue>
					</KpiInfo>
				</KpiCard>

				{/* KPI Card 4: Active Leads (example) */}
				<KpiCard>
					<IconWrapper style={{ backgroundColor: "var(--orangeDark)" }}>
						<FaUserFriends size={24} color='#fff' />
					</IconWrapper>
					<KpiInfo>
						<KpiTitle>Active Leads</KpiTitle>
						<KpiValue>
							<CountUp end={12} duration={1.5} />
						</KpiValue>
					</KpiInfo>
				</KpiCard>
			</KpiCardsWrapper>

			<Top3Wrapper>
				<SectionTitle>Top 3 Viewed Properties</SectionTitle>
				<PropertyList>
					{top3Properties.map((p, index) => (
						<PropertyItem key={index}>
							{p.name} - {p.views} views
						</PropertyItem>
					))}
				</PropertyList>
			</Top3Wrapper>

			<TableWrapper>
				<SectionTitle>All Properties</SectionTitle>
				<StyledTable
					columns={columns}
					dataSource={dataSource}
					pagination={false}
				/>
			</TableWrapper>
		</AgentSummaryWrapper>
	);
};

export default AgentSummary;

/* --------------------------------------
       STYLED COMPONENTS
-------------------------------------- */

const AgentSummaryWrapper = styled.div`
	width: 100%;
	min-height: 400px;
	background: var(--accent-color-2);
	padding: 20px;
	border-radius: 8px;
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

const PropertyList = styled.ul`
	list-style: none;
	padding-left: 0;
`;

const PropertyItem = styled.li`
	font-size: 0.95rem;
	color: var(--text-color-secondary);
	margin-bottom: 0.4rem;
`;

/* Table Wrapper */
const TableWrapper = styled.div`
	background: var(--mainWhite);
	border-radius: 8px;
	padding: 1rem;
	box-shadow: var(--box-shadow-light);
`;

const StyledTable = styled(Table)`
	/* Custom AntD table styling if needed */
	.ant-table-thead > tr > th {
		background: var(--neutral-light);
		font-weight: 600;
		color: var(--text-color-dark);
	}

	.ant-table-tbody > tr > td {
		color: var(--text-color-secondary);
		vertical-align: middle;
	}
`;
