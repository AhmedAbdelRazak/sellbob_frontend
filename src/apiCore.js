export const PropertySignup = (userData) => {
	return fetch(`${process.env.REACT_APP_API_URL}/property-listing`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(userData),
	})
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
};

// Basic fetch patterns for the client side of your app

// 1. Create new support case (client → property owner or admin)
export const createNewSupportCase = (caseData) => {
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/new`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(caseData),
	})
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.error("Error creating new support case:", err);
			throw err;
		});
};

// 2. Update support case (e.g. add message, change status, etc.)
export const updateSupportCase = (caseId, updateData) => {
	// If your backend requires token-based auth, pass it in headers
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/${caseId}`, {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			// Authorization: `Bearer ${token}`, // If needed
		},
		body: JSON.stringify(updateData),
	})
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.error("Error updating support case:", err);
			throw err;
		});
};

// 3. Get a support case by ID
export const getSupportCaseById = (caseId) => {
	return fetch(`${process.env.REACT_APP_API_URL}/support-cases/${caseId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.error("Error fetching support case by ID:", err);
			throw err;
		});
};

// 4. Mark messages as seen by client
export const updateSeenByCustomer = (caseId) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases/${caseId}/seen/client`,
		{
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}
	)
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.error("Error marking messages as seen by customer:", err);
			throw err;
		});
};

// 5. Get unseen messages for a specific client (if needed)
export const getUnseenMessagesByCustomer = (clientId) => {
	// Make sure you have a route like: GET /support-cases-client/:clientId/unseen
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases-client/${clientId}/unseen`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}
	)
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.error("Error fetching unseen messages by customer:", err);
			throw err;
		});
};

// 6. (Optional) If you want only the count:
export const getUnseenMessagesCountByCustomer = (clientId) => {
	// If your backend has a route returning only the count
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases-client/${clientId}/unseen/count`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		}
	)
		.then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(text);
				});
			}
			return response.json();
		})
		.catch((err) => {
			console.error("Error fetching unseen messages count by customer:", err);
			throw err;
		});
};

// 7. Fetch all active properties (for user to pick from if needed)
export const gettingActivePropertyList = async () => {
	// Or your actual route: /list-of-active-properties, etc.
	const response = await fetch(
		`${process.env.REACT_APP_API_URL}/list-of-agent-properties-active`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		}
	);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text);
	}
	return response.json();
};

export const gettingFeaturedProperties = async () => {
	// Or your actual route: /list-of-active-properties, etc.
	const response = await fetch(
		`${process.env.REACT_APP_API_URL}/list-of-agent-properties-active-featured`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		}
	);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text);
	}
	return response.json();
};

export const gettingActiveStatesAndCities = async () => {
	// Or your actual route: /list-of-active-properties, etc.
	const response = await fetch(
		`${process.env.REACT_APP_API_URL}/active-states-cities`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		}
	);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text);
	}
	return response.json();
};

export const getWebsiteSetup = (userId, token) => {
	return fetch(`${process.env.REACT_APP_API_URL}/website-basic-setup`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => {
			if (!res.ok) {
				// If 404, doc not found
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => console.error("Error getting single setup:", err));
};

export const getUserDetails = (userId, token) => {
	return fetch(`${process.env.REACT_APP_API_URL}/user/${userId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => {
			if (!res.ok) {
				// If 404, doc not found
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => console.error("Error getting single setup:", err));
};

export const updateUserProfile = async (
	targetUserId,
	userId,
	token,
	updatePayload
) => {
	try {
		const res = await fetch(
			`${process.env.REACT_APP_API_URL}/client-account/update-profile/${targetUserId}/${userId}`,
			{
				method: "PUT",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatePayload),
			}
		);
		return await res.json();
	} catch (err) {
		console.error(err);
		return { error: "Failed to update user." };
	}
};

export const storeLatestViewedProperty = (propertyId) => {
	try {
		// Read existing storage
		let stored = localStorage.getItem("latestViewed");
		if (!stored) {
			stored = [];
		} else {
			stored = JSON.parse(stored);
		}

		// Current timestamp (ISO string or your preferred format)
		const dateNow = new Date().toISOString();

		// Check if this property already exists in localStorage
		const existingIndex = stored.findIndex((item) => item._id === propertyId);

		if (existingIndex >= 0) {
			// Property already in localStorage => update datetimeClicked
			stored[existingIndex].datetimeClicked = dateNow;

			// Move it to the front for "most recent" sorting
			const [existing] = stored.splice(existingIndex, 1); // remove
			stored.unshift(existing); // re-insert at front
		} else {
			// New property => create entry
			stored.unshift({
				_id: propertyId,
				datetimeClicked: dateNow,
			});

			// Keep only the 10 latest
			if (stored.length > 10) {
				stored.pop();
			}
		}

		// Save back to localStorage
		localStorage.setItem("latestViewed", JSON.stringify(stored));
	} catch (err) {
		console.error("Error storing latestViewed property:", err);
	}
};
