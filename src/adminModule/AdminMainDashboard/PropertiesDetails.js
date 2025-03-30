/** @format */
// PropertiesDetails.jsx

import React from "react";
import styled from "styled-components";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

/**
 * We define a local fallback for SectionTitle in case
 * the parent doesn't provide one or provides `undefined`.
 */
const FallbackSectionTitle = styled.h2`
	margin-bottom: 1rem;
	color: var(--primary-color);
	font-size: 1.2rem;
`;

const PropertiesDetails = ({
	handleClearActive,
	pagination,
	tableData,
	handleFilterActive,
	SectionTitle, // potentially passed in from the parent
	handleFilterNotFeatured,
	featuredFilter,
	searchValue,
	handleSearchButton,
	handleSearchChange,
	handleSearchEnter,
	handleClearAll,
	activeFilter,
	handleFilterInactive,
	handleRowClick,
	handleFilterFeatured,
	handleClearFeatured,
	handleClickActive,
	handleClickFeatured,
	top3,
}) => {
	// Use the fallback if SectionTitle is missing/undefined
	const TitleComp = SectionTitle || FallbackSectionTitle;

	return (
		<>
			{/* Top 3 */}
			<Top3Wrapper>
				<TitleComp>Top 3 Viewed Properties</TitleComp>
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
			<TitleComp>All Agents & Properties</TitleComp>
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
									<td style={{ textTransform: "capitalize" }}>
										{row.property}
									</td>
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
												backgroundColor: row.featured ? "#c2f8c2" : "#d1ecf1",
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
					Page: {pagination.page} / {pagination.pages} &nbsp; | &nbsp;Total:{" "}
					{pagination.total} rows
				</p>
			</PaginationInfo>
		</>
	);
};

export default PropertiesDetails;

/* ------------------ Styled Components ------------------ */
const SearchFilterWrapper = styled.div`
	margin-bottom: 20px;

	.filterRowsContainer {
		max-width: 700px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 15px;
		border: 1px lightgray solid;
		padding: 10px;
		border-radius: 10px;
	}

	.filterRow {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	button {
		font-size: 0.8rem;
		font-weight: bold;
	}
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
				transition: var(--mainTransition);

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

const Top3Wrapper = styled.div`
	margin-bottom: 2rem;
`;
