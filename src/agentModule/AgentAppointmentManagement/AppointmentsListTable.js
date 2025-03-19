/** @format */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getAppointments, getAppointmentById } from "../apiAgent";
import { isAuthenticated } from "../../auth";
import NewAppointmentForm from "./NewAppointmentForm";

// Import antd components for styling (buttons, modal)
import { Button, Modal } from "antd";

// A small helper to pick a background color for each status
const getStatusColor = (status) => {
	switch (status) {
		case "cancelled":
			return "#ffe8e6"; // light red
		case "confirmed":
			return "#e6f7ff"; // light blue
		case "pending":
			return "#fff7e6"; // light orange
		case "completed":
			return "#f6ffed"; // light green
		default:
			return "#ffffff"; // default white background
	}
};

const AppointmentsListTable = ({ agentProperties }) => {
	const { user, token } = isAuthenticated();
	const [appointments, setAppointments] = useState([]);
	const [selectedAppointment, setSelectedAppointment] = useState(null);

	// Filter states
	// "all" is the default so that "All" is selected
	const [filter, setFilter] = useState("all");
	const [page, setPage] = useState(1);
	const [limit] = useState(20);

	// Possibly store pagination info
	const [totalPages, setTotalPages] = useState(1);

	// On mount and whenever filter or page changes, fetch appointments
	useEffect(() => {
		fetchAppointments();
		// eslint-disable-next-line
	}, [filter, page]);

	const fetchAppointments = () => {
		getAppointments(user._id, token, { filter, page, limit }).then((res) => {
			if (res && !res.error) {
				setAppointments(res.data || []);
				setTotalPages(res.totalPages || 1);
			}
		});
	};

	// When a filter button is clicked
	const handleFilterClick = (value) => {
		setFilter(value);
		setPage(1);
	};

	// When a table row is clicked, open the modal with the selected appointment
	const handleRowClick = (appt) => {
		getAppointmentById(user._id, token, appt._id).then((res) => {
			if (res && !res.error) {
				setSelectedAppointment(res);
			}
		});
	};

	// Called by <NewAppointmentForm> after an update is saved
	const handleUpdateSuccess = (updatedAppt) => {
		setSelectedAppointment(null); // close the modal
		fetchAppointments(); // re-fetch to show updated data
	};

	// For pagination
	const handlePrevPage = () => {
		if (page > 1) setPage(page - 1);
	};
	const handleNextPage = () => {
		if (page < totalPages) setPage(page + 1);
	};

	return (
		<Wrapper>
			<h2>Appointments</h2>

			<div className='filterBtns'>
				<Button
					type={filter === "all" ? "primary" : "default"}
					onClick={() => handleFilterClick("all")}
				>
					All
				</Button>
				<Button
					type={filter === "today" ? "primary" : "default"}
					onClick={() => handleFilterClick("today")}
				>
					Today
				</Button>
				<Button
					type={filter === "yesterday" ? "primary" : "default"}
					onClick={() => handleFilterClick("yesterday")}
				>
					Yesterday
				</Button>
				<Button
					type={filter === "next7days" ? "primary" : "default"}
					onClick={() => handleFilterClick("next7days")}
				>
					Next 7 Days
				</Button>

				<Button
					type={filter === "" ? "primary" : "default"}
					onClick={() => handleFilterClick("")}
				>
					Last 30 days
				</Button>
			</div>

			<div className='tableWrapper'>
				<table className='myStyledTable'>
					<thead>
						<tr>
							<th>#</th>
							<th>Property</th>
							<th>Agent</th>
							<th>Client</th>
							<th>Date</th>
							<th>Time</th>
							<th>Status</th>
							<th>Created On</th>
						</tr>
					</thead>
					<tbody>
						{appointments && appointments.length > 0 ? (
							appointments.map((appt, index) => {
								const createdDate = new Date(appt.createdAt);
								const createdStr = !isNaN(createdDate)
									? createdDate.toLocaleDateString()
									: "—";

								const apptDate = new Date(appt.appointmentDate);
								const apptDateStr = !isNaN(apptDate)
									? apptDate.toLocaleDateString()
									: "—";

								return (
									<tr
										key={appt._id}
										onClick={() => handleRowClick(appt)}
										// Apply the status-based background color
										style={{
											backgroundColor: getStatusColor(appt.appointmentStatus),
										}}
									>
										<td>{(page - 1) * limit + (index + 1)}</td>
										<td>{appt.propertyName || "—"}</td>
										<td>{appt.agentName || "—"}</td>
										<td>{appt.clientName || "—"}</td>
										<td>{apptDateStr}</td>
										<td>{appt.appointmentTime || "—"}</td>
										<td
											style={{
												fontWeight: "bold",
												textTransform: "capitalize",
											}}
										>
											{appt.appointmentStatus}
										</td>
										<td>{createdStr}</td>
									</tr>
								);
							})
						) : (
							<tr>
								<td colSpan='8'>No appointments found.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<PaginationWrapper>
				<Button disabled={page <= 1} onClick={handlePrevPage}>
					Prev
				</Button>
				<span>
					Page {page} of {totalPages}
				</span>
				<Button disabled={page >= totalPages} onClick={handleNextPage}>
					Next
				</Button>
			</PaginationWrapper>

			<Modal
				title='Update Appointment'
				visible={!!selectedAppointment}
				onCancel={() => setSelectedAppointment(null)}
				footer={null}
				width={"68%"}
				destroyOnClose // so the form is reset each time
			>
				{selectedAppointment && (
					<NewAppointmentForm
						existingAppt={selectedAppointment}
						onSave={handleUpdateSuccess}
						agentProperties={agentProperties}
					/>
				)}
			</Modal>
		</Wrapper>
	);
};

export default AppointmentsListTable;

/* ----------------- STYLING ----------------- */
const Wrapper = styled.div`
	margin-top: 20px;

	h2 {
		margin-bottom: 1rem;
	}

	.filterBtns {
		margin-bottom: 10px;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tableWrapper {
		overflow-x: auto; /* in case of small screens */
		box-shadow: var(--box-shadow-light);
		border-radius: 6px;
		margin-bottom: 1rem;

		.myStyledTable {
			width: 100%;
			border-collapse: collapse;
			background: var(--mainWhite);
			font-size: 0.9rem;
			border-radius: 6px; /* rounded corners for the table itself */
			overflow: hidden; /* ensure corners remain rounded */

			thead {
				background: var(--neutral-light2);
			}

			th,
			td {
				padding: 0.75rem;
				border: 1px solid var(--border-color-light);
				text-align: left;
			}

			tbody tr {
				cursor: pointer;
				transition: var(--main-transition);

				&:hover {
					/* slightly darker hover effect over the base color */
					opacity: 0.9;
				}
			}
		}
	}

	/* The update form is replaced with a Modal, so no .updateForm here */
`;

const PaginationWrapper = styled.div`
	margin-top: 10px;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	span {
		font-size: 0.85rem;
	}
`;
