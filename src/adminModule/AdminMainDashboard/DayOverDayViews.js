import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { Select } from "antd";
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

/**
 * DayOverDayViews
 * - Displays a Recharts line chart of "views per day" aggregated across all properties or filtered by one.
 * - Props:
 *     tableData: array of objects, each with { property, viewsPerDay: [{ date, count }], etc. }
 */
const DayOverDayViews = ({ tableData }) => {
	// Collect unique property names (excluding "N/A" or empty if you wish)
	const propertyOptions = useMemo(() => {
		const uniqueProps = new Set();
		tableData.forEach((td) => {
			if (td.property && td.property !== "N/A") {
				uniqueProps.add(td.property);
			}
		});
		return Array.from(uniqueProps);
	}, [tableData]);

	// Which property is selected? Default = "All"
	const [selectedProp, setSelectedProp] = useState("All");

	// When user changes selection in the dropdown
	const handleSelectChange = (value) => {
		setSelectedProp(value);
	};

	// Aggregate daily views (for "All" properties or just the selected one)
	const chartData = useMemo(() => {
		// 1) Filter tableData by property if not "All"
		let filteredRows = tableData;
		if (selectedProp !== "All") {
			filteredRows = tableData.filter((td) => td.property === selectedProp);
		}

		// 2) Sum counts for each date across matched rows
		const mapByDate = {}; // e.g. { '03/26/2025': totalViews, ... }
		filteredRows.forEach((td) => {
			if (Array.isArray(td.viewsPerDay)) {
				td.viewsPerDay.forEach((vpd) => {
					const dateStr = vpd.date; // 'MM/DD/YYYY'
					if (!mapByDate[dateStr]) {
						mapByDate[dateStr] = 0;
					}
					mapByDate[dateStr] += vpd.count || 0;
				});
			}
		});

		// 3) Convert that object into an array, sorted by date
		const result = Object.keys(mapByDate).map((dateKey) => {
			// Parse with dayjs for sorting
			const parsed = dayjs(dateKey, "MM/DD/YYYY");
			return {
				dateKey, // store original '03/26/2025' string for display if you want
				date: parsed.isValid() ? parsed.format("YYYY-MM-DD") : dateKey, // standardized
				count: mapByDate[dateKey],
			};
		});

		result.sort((a, b) => {
			// sort by the 'date' field (string "YYYY-MM-DD" sorts correctly)
			if (a.date < b.date) return -1;
			if (a.date > b.date) return 1;
			return 0;
		});

		return result;
	}, [selectedProp, tableData]);

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

			{/* Recharts ResponsiveContainer + LineChart */}
			{chartData.length === 0 ? (
				<p>No data to display.</p>
			) : (
				<div style={{ width: "100%", height: 350 }}>
					<ResponsiveContainer>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis
								dataKey='date' // or "dateKey" if you want original
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
		</div>
	);
};

export default DayOverDayViews;
