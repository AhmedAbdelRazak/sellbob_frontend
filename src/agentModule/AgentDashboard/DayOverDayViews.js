/** @format */
import React, { useState, useMemo } from "react";
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
import dayjs from "dayjs";
import { Select } from "antd";

import isBetween from "dayjs/plugin/isBetween"; // plugin for any isBetween usage
dayjs.extend(isBetween);

const DayOverDayViews = ({ tableData }) => {
	// 1) Gather property names for the drop-down
	const propertyOptions = useMemo(() => {
		const uniqueProps = new Set();
		tableData.forEach((td) => {
			if (td.property && td.property !== "N/A") {
				uniqueProps.add(td.property);
			}
		});
		return Array.from(uniqueProps);
	}, [tableData]);

	// 2) Drop-down state: Which property is selected?
	const [selectedProp, setSelectedProp] = useState("All");

	const handleSelectChange = (value) => {
		setSelectedProp(value);
	};

	// 3) Filter for the line chart if not "All"
	const filteredRows = useMemo(() => {
		if (selectedProp === "All") return tableData;
		return tableData.filter((td) => td.property === selectedProp);
	}, [selectedProp, tableData]);

	// 4) Build chart data by summing each row’s `viewsPerDay`
	//    This is presumably the "30 day distribution" you already computed.
	const chartData = useMemo(() => {
		const mapByDate = {};
		filteredRows.forEach((td) => {
			if (Array.isArray(td.viewsPerDay)) {
				td.viewsPerDay.forEach((vpd) => {
					// vpd.date is like "03/27/2025"
					if (!mapByDate[vpd.date]) {
						mapByDate[vpd.date] = 0;
					}
					mapByDate[vpd.date] += vpd.count || 0;
				});
			}
		});

		// Convert map => array
		const result = Object.keys(mapByDate).map((dateKey) => {
			// parse "MM/DD/YYYY"
			const parsed = dayjs(dateKey, "MM/DD/YYYY");
			return {
				dateKey, // original string
				date: parsed.isValid() ? parsed.format("YYYY-MM-DD") : dateKey,
				count: mapByDate[dateKey],
			};
		});

		// sort ascending
		result.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
		return result;
	}, [filteredRows]);

	// 5) GROUPING for the table
	//    We want (ownerName, userName, email) => sum of views, minDate -> maxDate
	//    so each row is 1 unique combo of (owner, userName, email).
	const groupedUserViews = useMemo(() => {
		const map = new Map();

		filteredRows.forEach((row) => {
			const owner = row.ownerName || "Unknown Owner";

			// read userViewsByDays
			(row.userViewsByDays || []).forEach((entry) => {
				const userName = entry.userName || "Guest";
				const userEmail = entry.Email || "guest@example.com";

				const key = `${owner}||${userName}||${userEmail}`;
				let stats = map.get(key);
				if (!stats) {
					stats = {
						ownerName: owner,
						userName,
						email: userEmail,
						count: 0,
						minDate: null,
						maxDate: null,
					};
				}

				// increment count
				stats.count++;

				// update minDate/maxDate
				const d = dayjs(entry.Date);
				if (!stats.minDate || d.isBefore(stats.minDate)) {
					stats.minDate = d;
				}
				if (!stats.maxDate || d.isAfter(stats.maxDate)) {
					stats.maxDate = d;
				}

				map.set(key, stats);
			});
		});

		// convert map => array
		const result = [];
		map.forEach((stats) => {
			// produce "Mar 27 2025 - Apr 1 2025" style range if we have minDate, maxDate
			let dateRange = "";
			if (stats.minDate && stats.maxDate) {
				const minStr = stats.minDate.format("MMM D YYYY");
				const maxStr = stats.maxDate.format("MMM D YYYY");
				dateRange = `${minStr} - ${maxStr}`;
			}

			result.push({
				ownerName: stats.ownerName,
				userName: stats.userName,
				email: stats.email,
				count: stats.count,
				dateRange,
			});
		});

		// sort descending by count
		result.sort((a, b) => b.count - a.count);

		return result;
	}, [filteredRows]);

	return (
		<div
			style={{
				marginTop: "50px",
				marginBottom: "50px",
				padding: "1rem",
				border: "1px solid #ccc",
				borderRadius: 6,
			}}
		>
			<h3>Day Over Day Views</h3>

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

			{/* LINE CHART */}
			{chartData.length === 0 ? (
				<p>No data to display.</p>
			) : (
				<div style={{ width: "100%", height: 350 }}>
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

			{/* GROUPED TABLE => (ownerName, userName, email, count, dateRange) */}
			<div style={{ marginTop: "2rem" }}>
				<h4>Views by User & Owner</h4>
				{groupedUserViews.length === 0 ? (
					<p>No views found.</p>
				) : (
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead
							style={{
								backgroundColor: "#f5f5f5",
								borderBottom: "1px solid #ccc",
							}}
						>
							<tr>
								<th style={thStyle}>Owner Name</th>
								<th style={thStyle}>User Name</th>
								<th style={thStyle}>Email</th>
								<th style={thStyle}>Views</th>
								<th style={thStyle}>Date Range</th>
							</tr>
						</thead>
						<tbody>
							{groupedUserViews.map((row, i) => (
								<tr
									key={i}
									style={{ borderBottom: "1px solid #eee", textAlign: "left" }}
								>
									<td style={tdStyle}>{row.ownerName}</td>
									<td style={tdStyle}>{row.userName}</td>
									<td style={tdStyle}>{row.email}</td>
									<td style={tdStyle}>{row.count}</td>
									<td style={tdStyle}>{row.dateRange}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

/* -------------------------------------------
   Inline styles for table cells
------------------------------------------- */
const thStyle = {
	padding: "0.5rem",
	textAlign: "left",
	borderBottom: "1px solid #ccc",
};

const tdStyle = {
	padding: "0.5rem",
};

export default DayOverDayViews;
