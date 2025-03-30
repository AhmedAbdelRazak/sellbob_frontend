/** @format */
// src/components/AdminDashboard/AppointmentsOverview.jsx

import React, { useMemo } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

const AppointmentsOverview = ({ tableData = [] }) => {
	/**
	 * Flatten out each property’s appointmentsBreakdown (upcoming, today, last7Days)
	 * into a single array of objects. Each object is one appointment row,
	 * with columns: property, owner, clientName, date, phone, email, category, etc.
	 */
	const flattenedAppointments = useMemo(() => {
		const rows = [];

		tableData.forEach((propertyRow) => {
			const prop = propertyRow.property || "Untitled";
			const owner = propertyRow.ownerName || "No Owner";
			const breakdown = propertyRow.appointmentsBreakdown;
			if (!breakdown) return;

			// Each array: upcoming, today, last7Days
			const { upcoming = [], today = [], last7Days = [] } = breakdown;

			// Helper to push each appointment
			const pushAppointments = (arr, category) => {
				arr.forEach((appt) => {
					rows.push({
						// from the property row
						property: prop,
						ownerName: owner,
						// from the appointment doc
						appointmentDate: appt.appointmentDate,
						phone: appt.phone || "",
						email: appt.email || "",
						clientName: appt.clientName || (appt.clientId?.name ?? "Guest"),
						category, // "upcoming", "today", or "last7Days"
					});
				});
			};

			pushAppointments(upcoming, "upcoming");
			pushAppointments(today, "today");
			pushAppointments(last7Days, "last7Days");
		});

		// Sort by appointmentDate ascending
		rows.sort(
			(a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
		);
		return rows;
	}, [tableData]);

	return (
		<AppointmentsOverviewWrapper>
			<h2>Appointments Overview</h2>

			{flattenedAppointments.length === 0 ? (
				<EmptyState>No appointments found.</EmptyState>
			) : (
				<StyledTable>
					<thead>
						<tr>
							<th>Property</th>
							<th>Owner</th>
							<th>Client</th>
							<th>Phone</th>
							<th>Email</th>
							<th>Date</th>
							<th>Category</th>
						</tr>
					</thead>
					<tbody>
						{flattenedAppointments.map((appt, idx) => {
							const dateStr = dayjs(appt.appointmentDate).format(
								"MMM D, YYYY h:mm A"
							);
							return (
								<tr key={idx}>
									<td>{appt.property}</td>
									<td>{appt.ownerName}</td>
									<td>{appt.clientName}</td>
									<td>{appt.phone}</td>
									<td>{appt.email}</td>
									<td>{dateStr}</td>
									<td>{appt.category}</td>
								</tr>
							);
						})}
					</tbody>
				</StyledTable>
			)}
		</AppointmentsOverviewWrapper>
	);
};

export default AppointmentsOverview;

/* ------------------ STYLED COMPONENTS ------------------ */
const AppointmentsOverviewWrapper = styled.div`
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
