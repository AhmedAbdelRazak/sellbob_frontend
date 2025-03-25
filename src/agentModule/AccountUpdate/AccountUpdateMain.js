// AccountUpdateMain.js

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import AdminNavbar from "../AgentNavbar/AgentNavbar";
import { isAuthenticated } from "../../auth";
import { useLocation } from "react-router-dom";
import { getSingleUser, updateUserProfile } from "../apiAgent";

import { Button, Input, Spin } from "antd"; // Removed 'message' since not used

import SingleProfilePhotoUpload from "./SingleProfilePhotoUpload";

const AccountUpdateMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	// Grab logged‐in user and token from auth
	const { user: loggedInUser, token } = isAuthenticated() || {};

	// We store the user data in `formData`:
	const [formData, setFormData] = useState({
		_id: "",
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		profilePhoto: {
			public_id: "",
			url: "",
		},
	});

	const location = useLocation();

	// For an admin (role=1000), we expect "?agent=xxx" in URL
	// Otherwise, the user updates themselves
	const [targetUserId, setTargetUserId] = useState("");

	// Collapse sidebar on smaller screens
	useEffect(() => {
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}
	}, []);

	// Determine which user we are updating:
	useEffect(() => {
		if (!loggedInUser) {
			setErrorMsg("You must be logged in to update account.");
			return;
		}

		if (loggedInUser.role === 1000) {
			// Admin
			const searchParams = new URLSearchParams(location.search);
			const agentParam = searchParams.get("agent");
			if (!agentParam) {
				return;
			}
			setTargetUserId(agentParam);
		} else {
			// Regular user => themselves
			setTargetUserId(loggedInUser._id);
		}
	}, [location, loggedInUser]);

	const adminUserId = loggedInUser ? loggedInUser._id : "";

	// Wrap `fetchUserData` in useCallback so we can safely include it in the effect dependencies
	const fetchUserData = useCallback(
		async (id) => {
			try {
				setLoading(true);
				const data = await getSingleUser(id, adminUserId, token);
				if (data.error) {
					setErrorMsg(data.error);
				} else {
					// If there's a photo, store it. Otherwise keep blank
					const userPhoto =
						data.profilePhoto && data.profilePhoto.url
							? data.profilePhoto
							: { public_id: "", url: "" };

					setFormData({
						_id: data._id,
						name: data.name || "",
						email: data.email || "",
						phone: data.phone || "",
						password: "",
						confirmPassword: "",
						profilePhoto: userPhoto,
						activeUser: data.activeUser,
					});
				}
			} catch (err) {
				console.error("fetchUserData error:", err);
				setErrorMsg("Error fetching user data.");
			} finally {
				setLoading(false);
			}
		},
		[adminUserId, token]
	);

	// Once we have targetUserId, fetch that user's data
	useEffect(() => {
		if (!targetUserId) return;
		fetchUserData(targetUserId);
	}, [targetUserId, fetchUserData]);

	// Handle input changes for name/email/phone/password
	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
		setErrorMsg("");
		setSuccessMsg("");
	};

	// Called by SingleProfilePhotoUpload to update the parent's `profilePhoto`
	const handleProfilePhotoUpdate = (newPhoto) => {
		setFormData((prev) => ({
			...prev,
			profilePhoto: newPhoto,
		}));
	};

	// Submit changes => we store the user's data to your `updateUserProfile` route
	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMsg("");
		setSuccessMsg("");

		// Basic validations
		if (!formData.name.trim()) {
			return setErrorMsg("Name is required.");
		}
		if (!formData.email.trim()) {
			return setErrorMsg("Email is required.");
		}
		if (formData.password && formData.password.length < 6) {
			return setErrorMsg("Password must be at least 6 characters.");
		}
		if (formData.password !== formData.confirmPassword) {
			return setErrorMsg("Passwords do not match.");
		}

		try {
			setLoading(true);

			// Build payload
			const updatePayload = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				activeUser: formData.activeUser,
			};

			// If user typed a new password, include it
			if (formData.password) {
				updatePayload.password = formData.password;
			}

			// Assign the single profilePhoto object
			updatePayload.profilePhoto = formData.profilePhoto || {
				public_id: "",
				url: "",
			};

			// Send to backend
			const result = await updateUserProfile(
				targetUserId,
				adminUserId,
				token,
				updatePayload
			);
			if (result.error) {
				setErrorMsg(result.error);
			} else {
				setSuccessMsg("Profile updated successfully!");
				// Optionally clear password fields
				setFormData((prev) => ({
					...prev,
					password: "",
					confirmPassword: "",
				}));
			}
		} catch (error) {
			console.error("Update error:", error);
			setErrorMsg("Error updating account.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AccountUpdateMainWrapper show={collapsed}>
			<div className='grid-container-main'>
				{/* Left sidebar */}
				<div className='navcontent'>
					<AdminNavbar
						fromPage='AccountUpdate'
						setAdminMenuStatus={setAdminMenuStatus}
						AdminMenuStatus={AdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				{/* Main content area */}
				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<h2>Account Update</h2>

						{errorMsg && <ErrorBox>{errorMsg}</ErrorBox>}
						{successMsg && <SuccessBox>{successMsg}</SuccessBox>}

						{loading ? (
							<Spin tip='Loading...' />
						) : formData._id ? (
							// If we have user data, show the form
							<form onSubmit={handleSubmit}>
								{/* SinglePhoto component */}
								<SingleProfilePhotoUpload
									profilePhoto={formData.profilePhoto}
									setProfilePhoto={handleProfilePhotoUpdate}
								/>

								{/* Name */}
								<label>Name:</label>
								<Input
									name='name'
									value={formData.name}
									onChange={handleChange}
									style={{ marginBottom: 10 }}
								/>

								{/* Email */}
								<label>Email:</label>
								<Input
									name='email'
									type='email'
									value={formData.email}
									onChange={handleChange}
									style={{ marginBottom: 10 }}
								/>

								{/* Phone */}
								<label>Phone:</label>
								<Input
									name='phone'
									value={formData.phone}
									onChange={handleChange}
									style={{ marginBottom: 10 }}
								/>

								{/* Password */}
								<label>Password (leave empty to keep existing):</label>
								<Input
									name='password'
									type='password'
									value={formData.password}
									onChange={handleChange}
									style={{ marginBottom: 10 }}
								/>

								{/* Confirm Password */}
								<label>Confirm Password:</label>
								<Input
									name='confirmPassword'
									type='password'
									value={formData.confirmPassword}
									onChange={handleChange}
									style={{ marginBottom: 10 }}
								/>

								<Button type='primary' htmlType='submit'>
									Save Changes
								</Button>
							</form>
						) : (
							<p>No user data loaded yet.</p>
						)}
					</div>
				</div>
			</div>
		</AccountUpdateMainWrapper>
	);
};

export default AccountUpdateMain;

/* -------------------------------------- */
/*         STYLED COMPONENTS             */
/* -------------------------------------- */
const AccountUpdateMainWrapper = styled.div`
	min-height: 300px;
	overflow-x: hidden;
	margin-top: 20px;

	.grid-container-main {
		display: grid;
		grid-template-columns: 17% 75%;
	}

	.container-wrapper {
		border: 2px solid lightgrey;
		padding: 20px;
		border-radius: 20px;
		background: var(--mainWhite);
		margin: 0px 10px;
		width: 100%;
	}

	@media (max-width: 1000px) {
		.grid-container-main {
			grid-template-columns: 5% 95%;
		}
	}
`;

const ErrorBox = styled.div`
	background: #ffe5e5;
	color: #d8000c;
	padding: 0.75rem;
	border-radius: 4px;
	margin-bottom: 1rem;
	font-weight: 600;
`;

const SuccessBox = styled.div`
	background: #ecfff3;
	color: #1d9e74;
	padding: 0.75rem;
	border-radius: 4px;
	margin-bottom: 1rem;
	font-weight: 600;
`;
