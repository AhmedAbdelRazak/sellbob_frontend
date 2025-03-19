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

export const gettingPropertiesForAdmin = (userId, token, query = {}) => {
	const params = new URLSearchParams();

	if (query.search) params.append("search", query.search);

	// Check if active is a string
	if (typeof query.active === "string") {
		params.append("active", query.active);
	}

	// Check if featured is a string
	if (typeof query.featured === "string") {
		params.append("featured", query.featured);
	}

	if (query.page) params.append("page", query.page);
	if (query.limit) params.append("limit", query.limit);

	const url = `${process.env.REACT_APP_API_URL}/property-details/admin/${userId}?${params.toString()}`;

	return fetch(url, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
			"Cache-Control": "no-cache",
		},
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error fetching admin properties:", err);
		});
};

export const updatePropertyStatus = (userId, propertyId, token, newStatus) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/property-details/admin/update-status/${userId}/${propertyId}`,
		{
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ newStatus }),
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP Error! status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("updatePropertyStatus error:", err);
			throw err;
		});
};

export const updatePropertyFeatured = (
	userId,
	propertyId,
	token,
	newFeatured
) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/property-details/admin/update-featured/${userId}/${propertyId}`,
		{
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ newFeatured }),
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP Error! status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("updatePropertyStatus error:", err);
			throw err;
		});
};

/**
 * CREATE single setup (once only)
 */
export const createWebsiteSetup = (userId, token, setupData) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/website-basic-setup/${userId}`,
		{
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(setupData),
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => console.error("Error creating single setup:", err));
};

/**
 * GET single setup
 */
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

/**
 * UPDATE single setup (creates if none exist)
 */
export const updateWebsiteSetup = (userId, token, updateData) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/website-basic-setup/${userId}`,
		{
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updateData),
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => console.error("Error updating single setup:", err));
};

/**
 * DELETE single setup
 */
export const deleteWebsiteSetup = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/website-basic-setup/${userId}`,
		{
			method: "DELETE",
			headers: {
				Accept: "application/json",
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
		.catch((err) => console.error("Error deleting single setup:", err));
};

//Support Cases
export const adminGetActiveB2CChats = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/admin/support-cases/b2c/open/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
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
			console.error("Error fetching admin active B2C chats:", err);
		});
};

/**
 * 2) Get closed B2C (client ↔ admin) cases
 *    GET /admin/support-cases/b2c/closed/:userId
 */
export const adminGetClosedB2CChats = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/admin/support-cases/b2c/closed/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
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
			console.error("Error fetching admin closed B2C chats:", err);
		});
};

/**
 * 3) Get active B2B (agent ↔ admin) cases
 *    GET /admin/support-cases/b2b/open/:userId
 */
export const adminGetActiveB2BChats = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/admin/support-cases/b2b/open/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
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
			console.error("Error fetching admin active B2B chats:", err);
		});
};

/**
 * 4) Get closed B2B (agent ↔ admin) cases
 *    GET /admin/support-cases/b2b/closed/:userId
 */
export const adminGetClosedB2BChats = (userId, token) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/admin/support-cases/b2b/closed/${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
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
			console.error("Error fetching admin closed B2B chats:", err);
		});
};

/**
 * 5) Create a new support case (B2C or B2B) as Admin
 *    POST /support-cases/new
 *
 *    - If you want to create a new B2B (admin↔agent), you'd set role=1000 in the body
 *    - If you want to create a new B2C (admin↔client), also possible but typically a client starts it.
 */
export const adminCreateSupportCase = (token, supportData) => {
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
			console.error("Error creating new admin support case:", err);
		});
};

/**
 * 6) Get a specific support case by ID (admin can see everything)
 *    GET /support-cases/:id
 */
export const adminGetSupportCaseById = (caseId, token) => {
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
			console.error("Error fetching support case by ID (admin):", err);
		});
};

/**
 * 7) Update an existing support case (e.g., add a message, close it, etc.)
 *    PUT /support-cases/:id
 *
 *    "updateData" example: { conversation: {...} } or { caseStatus: "closed" }
 */
export const adminUpdateSupportCase = (caseId, token, updateData) => {
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
			console.error("Error updating support case (admin):", err);
		});
};

/**
 * 8) Mark all messages as seen by Admin in a specific case
 *    PUT /support-cases/:id/seen-by-admin
 *
 *    Pass userId in the body if your controller requires it (some do).
 */
export const adminMarkAllMessagesAsSeen = (caseId, token, userId) => {
	return fetch(`${process.env.REACT_APP_API_URL}/mark-all-cases-as-seen`, {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ userId }),
	})
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json();
		})
		.catch((err) => {
			console.error("Error marking messages as seen by admin:", err);
		});
};

/**
 * 9) Delete a specific message from a conversation in a support case
 *    DELETE /support-cases/:caseId/messages/:messageId
 */
export const adminDeleteMessageFromConversation = (
	caseId,
	messageId,
	token
) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases/${caseId}/messages/${messageId}`,
		{
			method: "DELETE",
			headers: {
				Accept: "application/json",
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
			console.error("Error deleting message (admin):", err);
		});
};

/**
 * 10) (Optional) Get unseen messages count by Admin
 *     GET /support-cases/unseen/count?userId=xxx
 *     If you want an integer count of how many new messages are waiting for the admin.
 */
export const adminGetUnseenMessagesCount = (token, userId) => {
	return fetch(
		`${process.env.REACT_APP_API_URL}/support-cases/unseen/count?userId=${userId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! Status: ${res.status}`);
			}
			return res.json(); // returns { count: number }
		})
		.catch((err) => {
			console.error("Error fetching unseen messages count (admin):", err);
		});
};
