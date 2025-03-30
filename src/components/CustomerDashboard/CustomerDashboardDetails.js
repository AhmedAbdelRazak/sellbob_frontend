/** @format */
// CustomerDashboardDetails.js

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Tabs, Button, Input, Spin, message } from "antd";
import { FaHeart, FaUserEdit, FaEye } from "react-icons/fa";
import { useLocation, useHistory } from "react-router-dom";

import { isAuthenticated } from "../../auth";
import { updateUserProfile } from "../../apiCore"; // or wherever your updateUserProfile is

// Components
import SingleProfilePhotoUpload from "./SingleProfilePhotoUpload";
import PropertyDetails from "../Global/PropertyDetails"; // Renders an array of properties

const { TabPane } = Tabs;

const CustomerDashboardDetails = ({ userDetails }) => {
	const location = useLocation();
	const history = useHistory();

	/**
	 * 1) Manage which tab is active.
	 *    We'll check "?tab=1" or "?tab=2" or "?tab=3"
	 *    If none is set, default to "1".
	 */
	const [activeKey, setActiveKey] = useState("1");

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const tabParam = searchParams.get("tab");
		if (tabParam === "1" || tabParam === "2" || tabParam === "3") {
			setActiveKey(tabParam);
		} else {
			setActiveKey("1");
		}
	}, [location.search]);

	// Switch tabs, also update the query param
	const handleTabChange = (key) => {
		setActiveKey(key);
		const searchParams = new URLSearchParams(location.search);
		searchParams.set("tab", key);
		history.push({
			pathname: location.pathname,
			search: searchParams.toString(),
		});
	};

	// If userDetails not loaded:
	if (!userDetails || !userDetails._id) {
		return (
			<CustomerDashboardDetailsWrapper>
				<h2 style={{ color: "var(--primary-color)" }}>
					Loading user details...
				</h2>
			</CustomerDashboardDetailsWrapper>
		);
	}

	return (
		<CustomerDashboardDetailsWrapper>
			<Tabs
				activeKey={activeKey}
				onChange={handleTabChange}
				tabBarStyle={{
					backgroundColor: "var(--neutral-light3)",
					padding: "1rem",
					borderRadius: "8px",
				}}
			>
				{/* 1) Wishlist Tab */}
				<TabPane
					tab={
						<span>
							<FaHeart style={{ marginRight: 4 }} /> Wishlist
						</span>
					}
					key='1'
				>
					<WishListTab userDetails={userDetails} />
				</TabPane>

				{/* 2) Update Account Tab */}
				<TabPane
					tab={
						<span>
							<FaUserEdit style={{ marginRight: 4 }} /> Update Account
						</span>
					}
					key='2'
				>
					<UpdateAccountTab userDetails={userDetails} />
				</TabPane>

				{/* 3) Latest Viewed Tab */}
				<TabPane
					tab={
						<span>
							<FaEye style={{ marginRight: 4 }} /> Latest Viewed
						</span>
					}
					key='3'
				>
					<LatestViewedTab />
				</TabPane>
			</Tabs>
		</CustomerDashboardDetailsWrapper>
	);
};

export default CustomerDashboardDetails;

/* ------------------------------------------------------------------
   1) Wishlist Tab
------------------------------------------------------------------ */
const WishListTab = ({ userDetails }) => {
	// userDetails.userWishList.propertyDetails is an array of property docs
	const wishlistItems = userDetails?.userWishList?.propertyDetails || [];

	return (
		<TabContentWrapper>
			<h2 style={{ color: "var(--secondary-color)" }}>
				Your Added Wishlist{" "}
				<span role='img' aria-label='wishlist-emoji'>
					❤️
				</span>
			</h2>
			{wishlistItems.length === 0 ? (
				<EmptyMsg>No properties in your wishlist yet.</EmptyMsg>
			) : (
				<PropertyDetails properties={wishlistItems} />
			)}
		</TabContentWrapper>
	);
};

/* ------------------------------------------------------------------
   2) Update Account Tab
------------------------------------------------------------------ */
const UpdateAccountTab = ({ userDetails }) => {
	const { user, token } = isAuthenticated() || {};
	const [formData, setFormData] = useState({
		name: userDetails.name || "",
		email: userDetails.email || "",
		phone: userDetails.phone || "",
		password: "",
		confirmPassword: "",
		profilePhoto: userDetails.profilePhoto || { public_id: "", url: "" },
	});

	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	// Keep form in sync if userDetails changes
	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			name: userDetails.name || "",
			email: userDetails.email || "",
			phone: userDetails.phone || "",
			profilePhoto: userDetails.profilePhoto || { public_id: "", url: "" },
		}));
	}, [userDetails]);

	const handleChange = (e) => {
		setErrorMsg("");
		setSuccessMsg("");
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleProfilePhotoUpdate = (newPhoto) => {
		setFormData((prev) => ({
			...prev,
			profilePhoto: newPhoto,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMsg("");
		setSuccessMsg("");

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

			const payload = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				profilePhoto: formData.profilePhoto,
			};
			if (formData.password) {
				payload.password = formData.password;
			}

			// Make sure user is logged in
			if (!user || !token) {
				setErrorMsg("You must be logged in to update account.");
				setLoading(false);
				return;
			}

			// Call your updateUserProfile
			const result = await updateUserProfile(
				user._id,
				user._id,
				token,
				payload
			);
			if (result && result.error) {
				setErrorMsg(result.error);
			} else {
				setSuccessMsg("Profile updated successfully!");
				message.success("Profile updated successfully!");
				// Clear password fields
				setFormData((prev) => ({
					...prev,
					password: "",
					confirmPassword: "",
				}));
			}
		} catch (err) {
			console.error("Update error:", err);
			setErrorMsg("Error updating account.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<TabContentWrapper className='container'>
			<h2 style={{ color: "var(--secondary-color)" }}>Update Account</h2>

			{errorMsg && <ErrorBox>{errorMsg}</ErrorBox>}
			{successMsg && <SuccessBox>{successMsg}</SuccessBox>}

			{loading ? (
				<Spin tip='Updating...' />
			) : (
				<form onSubmit={handleSubmit}>
					<SingleProfilePhotoUpload
						profilePhoto={formData.profilePhoto}
						setProfilePhoto={handleProfilePhotoUpdate}
					/>

					<label style={{ fontWeight: 600 }}>Name:</label>
					<Input
						name='name'
						value={formData.name}
						onChange={handleChange}
						style={{ marginBottom: 10 }}
					/>

					<label style={{ fontWeight: 600 }}>Email:</label>
					<Input
						name='email'
						type='email'
						value={formData.email}
						onChange={handleChange}
						style={{ marginBottom: 10 }}
					/>

					<label style={{ fontWeight: 600 }}>Phone:</label>
					<Input
						name='phone'
						value={formData.phone}
						onChange={handleChange}
						style={{ marginBottom: 10 }}
					/>

					<label style={{ fontWeight: 600 }}>Password (optional):</label>
					<Input
						name='password'
						type='password'
						value={formData.password}
						onChange={handleChange}
						style={{ marginBottom: 10 }}
					/>

					<label style={{ fontWeight: 600 }}>Confirm Password:</label>
					<Input
						name='confirmPassword'
						type='password'
						value={formData.confirmPassword}
						onChange={handleChange}
						style={{ marginBottom: 10 }}
					/>

					<Button
						type='primary'
						htmlType='submit'
						style={{ backgroundColor: "var(--secondary-color)" }}
					>
						Save Changes
					</Button>
				</form>
			)}
		</TabContentWrapper>
	);
};

/* ------------------------------------------------------------------
   3) Latest Viewed Tab
------------------------------------------------------------------ */
const LatestViewedTab = () => {
	const [latestViewed, setLatestViewed] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	// On mount => read localStorage => POST to backend => setLatestViewed
	useEffect(() => {
		const fetchLatestViewedProperties = async () => {
			try {
				setLoading(true);

				// 1) Load from localStorage
				let stored = localStorage.getItem("latestViewed");
				if (!stored) {
					stored = [];
				} else {
					stored = JSON.parse(stored);
				}

				// 2) Extract array of IDs
				const propertyIds = stored.map((item) => item._id);

				if (propertyIds.length === 0) {
					// No latest viewed
					setLatestViewed([]);
					setLoading(false);
					return;
				}

				// 3) POST to backend => { propertyIds: [...] }
				const response = await fetch(
					`${process.env.REACT_APP_API_URL}/properties/latest-viewed`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ propertyIds }),
					}
				);
				if (!response.ok) {
					throw new Error("Failed to fetch latest viewed properties");
				}
				const data = await response.json();

				// 4) data is the array of property docs
				// We also want to keep the order consistent with localStorage “most recent” first
				// so we can reorder them in the same order as the propertyIds array
				const idOrderMap = new Map(propertyIds.map((id, idx) => [id, idx]));
				data.sort((a, b) => idOrderMap.get(a._id) - idOrderMap.get(b._id));

				setLatestViewed(data);
			} catch (err) {
				console.error(err);
				setErrorMsg(err.message || "Error fetching latest viewed properties");
			} finally {
				setLoading(false);
			}
		};

		fetchLatestViewedProperties();
	}, []);

	return (
		<TabContentWrapper>
			<h2 style={{ color: "var(--secondary-color)" }}>Latest Viewed</h2>

			{loading && <Spin tip='Loading your recently viewed properties...' />}
			{errorMsg && <ErrorBox>{errorMsg}</ErrorBox>}

			{!loading && !errorMsg && latestViewed.length === 0 && (
				<EmptyMsg>No recently viewed properties found.</EmptyMsg>
			)}

			{!loading && !errorMsg && latestViewed.length > 0 && (
				<PropertyDetails properties={latestViewed} />
			)}
		</TabContentWrapper>
	);
};

/* ------------------------------------------------------------------
   STYLED COMPONENTS
------------------------------------------------------------------ */
const CustomerDashboardDetailsWrapper = styled.div`
	padding: 1.5rem;
	background: var(--mainWhite);
`;

const TabContentWrapper = styled.div`
	margin-top: 1rem;
	h2 {
		font-weight: bold;
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

const EmptyMsg = styled.div`
	background-color: var(--accent-color-1);
	padding: 1rem;
	border-radius: 4px;
	color: var(--secondary-color-dark);
`;
