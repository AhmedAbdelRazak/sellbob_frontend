export const readUserId = (userId, token) => {
	return fetch(`${process.env.REACT_APP_API_URL}/user/${userId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`, // Add the token here
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.json();
		})
		.catch((err) => console.error("Error fetching reservations:", err));
};

export const cloudinaryUpload1 = (userId, token, image) => {
	return fetch(`${process.env.REACT_APP_API_URL}/admin/uploadimages`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(image),
		// body: image,
	})
		.then((response) => {
			return response.json();
		})
		.catch((err) => {
			console.log(err);
		});
};

export const createNewProperty = (userId, token, newPropertyDetails) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/new-property-details/create/${userId}`,
		{
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(newPropertyDetails),
		}
	)
		.then((response) => {
			return response.json();
		})
		.catch((err) => {
			console.log(err);
		});
};

export const gettingAgentProperties = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/list-of-agent-properties/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((response) => {
			return response.json();
		})
		.catch((err) => {
			console.log(err);
		});
};

export const updateProperty = (propertyId, userId, token, updatedData) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/property-details/update/${propertyId}/${userId}`,
		{
			method: "PUT", // or PATCH
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updatedData),
		}
	)
		.then((res) => res.json())
		.catch((err) => {
			console.log(err);
		});
};

// Get Active B2C Support Cases (client ↔ agent)
export const getActiveB2CChats = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases-clients/active/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error fetching active B2C chats:", err);
		});
};

// Get Active B2B Support Cases (agent ↔ super admin)
export const getActiveB2BChats = (userId, token) => {
	// Example route: /support-cases/active
	// Adjust if you have a custom route for B2B specifically
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases/active/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error fetching active B2B chats:", err);
		});
};

// Get Closed B2C Chats (History)
export const getClosedB2CChats = (userId, token) => {
	// Example route: /support-cases/closed/clients
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases/closed/clients/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error fetching closed B2C chats:", err);
		});
};

// Get Closed B2B Chats (History)
export const getClosedB2BChats = (userId, token) => {
	// Example route: /support-cases/closed
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/closed`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error fetching closed B2B chats:", err);
		});
};

// Create a new Support Case (B2B: agent → admin)
export const createB2BSupportCase = (userId, token, supportData) => {
	// This corresponds to POST /support-cases/new
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/new`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(supportData),
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error creating new B2B support case:", err);
		});
};

// Update (PUT) an existing support case, e.g. adding a message or closing it
export const updateSupportCase = (caseId, updateData, token) => {
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/${caseId}`, {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(updateData),
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error updating support case:", err);
		});
};

// Get a specific support case by ID (if needed)
export const getSupportCaseById = (caseId, token) => {
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/${caseId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error fetching support case by ID:", err);
		});
};

export const markAllMessagesAsSeenByAgent = (caseId, userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases/${caseId}/seen-by-agent`,
		{
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ userId }),
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error marking all as seen by agent:", err);
		});
};

// CREATE new appointment
export const createNewAppointment = (userId, token, appointmentData) => {
	return fetch(`${process.env.REACT_APP_API_URL}/appointments`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`, // if you require auth
		},
		body: JSON.stringify(appointmentData),
	})
		.then((res) => res.json())
		.catch((err) => console.error("Error creating appointment:", err));
};

// GET appointments with optional filters
export const getAppointments = (userId, token, query = {}) => {
	// query can have { filter, page, limit } etc.
	const { filter, page, limit } = query;

	let url = `${process.env.REACT_APP_API_URL}/appointments?`;
	if (filter) url += `filter=${filter}&`;
	if (page) url += `page=${page}&`;
	if (limit) url += `limit=${limit}&`;

	return fetch(url, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => res.json())
		.catch((err) => console.error("Error fetching appointments:", err));
};

// GET single appointment
export const getAppointmentById = (userId, token, appointmentId) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((res) => res.json())
		.catch((err) => console.error("Error fetching single appointment:", err));
};

// UPDATE
export const updateAppointment = (userId, token, appointmentId, updates) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`,
		{
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updates),
		}
	)
		.then((res) => res.json())
		.catch((err) => console.error("Error updating appointment:", err));
};

// DELETE
export const deleteAppointment = (userId, token, appointmentId) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`,
		{
			method: "DELETE",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((res) => res.json())
		.catch((err) => console.error("Error deleting appointment:", err));
};
