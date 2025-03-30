/** @format */
// src/components/AdminDashboard/ActiveLeadsOverview.jsx

import React, { useMemo } from "react";
import styled from "styled-components";

const ActiveLeadsOverview = ({ tableData = [] }) => {
	/**
	 * Flatten out each property’s `activeLeads`.
	 * We create one row per lead with:
	 *   - property
	 *   - owner
	 *   - leadName
	 *   - leadEmail
	 *   - phone
	 *
	 * We also SKIP any row where leadName (case-insensitive)
	 * is the same as ownerName.
	 */
	const flattenedLeads = useMemo(() => {
		const rows = [];

		tableData.forEach((propertyRow) => {
			const prop = propertyRow.property || "Untitled";
			const owner = propertyRow.ownerName || "No Owner";
			const leads = propertyRow.activeLeads || [];

			leads.forEach((lead) => {
				const leadName = lead.name || "Unknown Lead";
				const leadEmail = lead.email || "noemail@example.com";

				// Case-insensitive comparison: skip if leadName === ownerName
				if (owner.toLowerCase() === leadName.toLowerCase()) {
					return; // skip this lead
				}

				rows.push({
					property: prop,
					ownerName: owner,
					leadName,
					leadEmail,
					phone: "N/A", // or lead.phone if available
				});
			});
		});

		// Sort by property name, or you could remove or adjust the sort
		rows.sort((a, b) => a.property.localeCompare(b.property));
		return rows;
	}, [tableData]);

	return (
		<ActiveLeadsOverviewWrapper>
			<h2>Active Leads Overview</h2>

			{flattenedLeads.length === 0 ? (
				<EmptyState>No active leads found.</EmptyState>
			) : (
				<StyledTable>
					<thead>
						<tr>
							<th>Property</th>
							<th>Owner</th>
							<th>Lead Name</th>
							<th>Lead Email</th>
							<th>Phone</th>
						</tr>
					</thead>
					<tbody>
						{flattenedLeads.map((item, idx) => (
							<tr key={idx}>
								<td>{item.property}</td>
								<td>{item.ownerName}</td>
								<td>{item.leadName}</td>
								<td>{item.leadEmail}</td>
								<td>{item.phone}</td>
							</tr>
						))}
					</tbody>
				</StyledTable>
			)}
		</ActiveLeadsOverviewWrapper>
	);
};

export default ActiveLeadsOverview;

/* ------------------ STYLED COMPONENTS ------------------ */
const ActiveLeadsOverviewWrapper = styled.div`
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
