/** @format */
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Select } from "antd";
import dayjs from "dayjs";

import {
	LineChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	Line,
	ResponsiveContainer,
} from "recharts";

const WishListOverview = ({ tableData = [] }) => {
	// 1) Gather property names that actually have wishlist entries
	//    If row.userWishList?.user?.length > 0 => it has wishlist
	const propertyOptions = useMemo(() => {
		const uniqueProps = new Set();
		tableData.forEach((row) => {
			const userArr = row.userWishList?.user || [];
			if (userArr.length > 0 && row.property && row.property !== "N/A") {
				uniqueProps.add(row.property);
			}
		});
		return Array.from(uniqueProps);
	}, [tableData]);

	// 2) Which property is selected?
	const [selectedProp, setSelectedProp] = useState("All");
	const handleSelectChange = (value) => {
		setSelectedProp(value);
	};

	// 3) Filter rows that have wishlist + match the property if not "All"
	const filteredRows = useMemo(() => {
		return tableData.filter((row) => {
			// skip rows with no wishlist users
			if (!row.userWishList?.user?.length) return false;

			// if "All" => keep
			if (selectedProp === "All") return true;

			// else only keep if row.property === selectedProp
			return row.property === selectedProp;
		});
	}, [tableData, selectedProp]);

	// 4) Build the line chart data => sum dayOverDay for these rows
	//    Each row has row.wishListDayOverDay => [ { date: "MM/DD/YYYY", count: number } ]
	const chartData = useMemo(() => {
		const mapByDate = {};
		filteredRows.forEach((row) => {
			if (Array.isArray(row.wishListDayOverDay)) {
				row.wishListDayOverDay.forEach((item) => {
					// item => { date: 'MM/DD/YYYY', count: number }
					if (!mapByDate[item.date]) {
						mapByDate[item.date] = 0;
					}
					mapByDate[item.date] += item.count || 0;
				});
			}
		});

		// Convert map => array
		const result = Object.keys(mapByDate).map((dateKey) => {
			// parse "MM/DD/YYYY" => standard
			const parsed = dayjs(dateKey, "MM/DD/YYYY");
			return {
				dateKey,
				date: parsed.isValid() ? parsed.format("YYYY-MM-DD") : dateKey,
				count: mapByDate[dateKey],
			};
		});

		// sort ascending
		result.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
		return result;
	}, [filteredRows]);

	// 5) Flatten for the table => combine all row.userWishList.user
	//    each => { property, location, ownerName, userName, userEmail }
	const flattenedWishlists = useMemo(() => {
		const rows = [];
		filteredRows.forEach((propertyRow) => {
			const propName = propertyRow.property || "Untitled";
			const loc = propertyRow.location || "N/A";
			const owner = propertyRow.ownerName || "No Owner";
			const wishlistUsers = propertyRow.userWishList?.user || [];

			wishlistUsers.forEach((u) => {
				rows.push({
					property: propName,
					location: loc,
					ownerName: owner,
					userName: u.name || "Guest",
					userEmail: u.email || "guest@example.com",
				});
			});
		});

		// optionally sort by property
		rows.sort((a, b) => a.property.localeCompare(b.property));
		return rows;
	}, [filteredRows]);

	return (
		<Wrapper>
			<h2>WishList Overview</h2>

			{/* Property Selector */}
			<div style={{ marginBottom: 10 }}>
				<Select
					style={{ width: 250 }}
					value={selectedProp}
					onChange={handleSelectChange}
				>
					<Select.Option value='All'>All Properties</Select.Option>
					{propertyOptions.map((propName) => (
						<Select.Option key={propName} value={propName}>
							{propName}
						</Select.Option>
					))}
				</Select>
			</div>

			{/* Line Chart for dayOverDay */}
			{chartData.length === 0 ? (
				<EmptyState>No wishlist data to display.</EmptyState>
			) : (
				<div style={{ width: "100%", height: 350, marginBottom: "2rem" }}>
					<ResponsiveContainer>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis
								dataKey='date'
								tickFormatter={(val) => dayjs(val).format("MMM D")}
							/>
							<YAxis />
							<Tooltip
								labelFormatter={(label) =>
									`Date: ${dayjs(label).format("MMM D, YYYY")}`
								}
							/>
							<Legend />
							<Line
								type='monotone'
								dataKey='count'
								stroke='#8884d8'
								strokeWidth={2}
								activeDot={{ r: 8 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			)}

			{/* Table of user wishlists */}
			{flattenedWishlists.length === 0 ? (
				<EmptyState>No wishlists found.</EmptyState>
			) : (
				<StyledTable>
					<thead>
						<tr>
							<th>Property</th>
							<th>Location</th>
							<th>Owner</th>
							<th>User Name</th>
							<th>User Email</th>
						</tr>
					</thead>
					<tbody>
						{flattenedWishlists.map((item, idx) => (
							<tr key={idx}>
								<td style={{ textTransform: "capitalize" }}>{item.property}</td>
								<td>{item.location}</td>
								<td>{item.ownerName}</td>
								<td>{item.userName}</td>
								<td>{item.userEmail}</td>
							</tr>
						))}
					</tbody>
				</StyledTable>
			)}
		</Wrapper>
	);
};

export default WishListOverview;

/* -------------- STYLED COMPONENTS -------------- */

const Wrapper = styled.div`
	margin: 1rem 0;
	border: 1px solid var(--neutral-light3);
	border-radius: 8px;
	padding: 1rem;
	background: var(--mainWhite);
`;

const StyledTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-size: 0.9rem;
	color: var(--text-color-dark);

	thead {
		background: var(--neutral-light2);
		th {
			padding: 0.75rem;
			text-align: left;
			border: 1px solid var(--border-color-light);
			font-weight: 600;
		}
	}

	tbody {
		tr {
			border-bottom: 1px solid var(--border-color-light);
			&:hover {
				background: var(--neutral-light3);
			}
			td {
				padding: 0.75rem;
				border: 1px solid var(--border-color-light);
			}
		}
	}
`;

const EmptyState = styled.div`
	background-color: var(--accent-color-1);
	padding: 1rem;
	border-radius: 4px;
	color: var(--secondary-color-dark);
`;
