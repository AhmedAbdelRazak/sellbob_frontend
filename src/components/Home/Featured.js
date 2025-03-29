/** @format */
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import { Modal, message } from "antd";
import { FaHeart } from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import your SignIn / SignUp forms and Auth helper
import Signin from "../../components/SinglePropertyPage/Signin";
import Signup from "../../components/SinglePropertyPage/Signup";
import { isAuthenticated } from "../../auth";

/* -------------- Utility Helpers -------------- */

// Helper to make a slug from the property name
const slugify = (str = "") => {
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // replace spaces with -
		.replace(/[^\w-]+/g, ""); // remove all non-word chars
};

// Helper to format price with comma separators
const formatPrice = (price) => {
	if (price === undefined || price === null) return "N/A";
	return price.toLocaleString("en-US");
};

// Currency symbol if "rupee", else just capitalize
const formatCurrency = (currency = "") => {
	if (!currency) return "";
	if (currency.toLowerCase() === "rupee") return "₹";
	return currency[0].toUpperCase() + currency.slice(1).toLowerCase();
};

// Combine images from propertyPhotos & roomCountDetails[].photos
const getAllPropertyImages = (property) => {
	const photosFromProperty = property?.propertyPhotos || [];
	let photosFromRooms = [];
	if (property?.roomCountDetails?.length > 0) {
		photosFromRooms = property.roomCountDetails
			.map((room) => room.photos || [])
			.flat();
	}
	return [...photosFromProperty, ...photosFromRooms].map((p) => p.url);
};

const Featured = ({ featuredProperties = [] }) => {
	/* ----------------------------------------------------------------
   | Auth & Wishlist
   ----------------------------------------------------------------*/
	const { user, token } = isAuthenticated() || {};
	const [signInModalOpen, setSignInModalOpen] = useState(false);
	const [isSignInForm, setIsSignInForm] = useState(true);

	// Map of propertyId => boolean (is it in the wishlist?)
	const [wishlistMap, setWishlistMap] = useState({});

	// A ref to track "dragging" state per property => no re-render needed
	const draggingRef = useRef({}); // e.g. { propertyId: boolean }

	// Track the ID of the user for whom we've already loaded the wishlist
	const [loadedForUserId, setLoadedForUserId] = useState(null);

	/* ----------------------------------------------------------------
   | Load user's wishlist from localStorage (only once per user._id)
   ----------------------------------------------------------------*/
	useEffect(() => {
		// If no user or no user._id, skip
		if (!user || !user._id) return;

		// If we already loaded for this user, skip re-checking
		if (loadedForUserId === user._id) return;

		try {
			const storedJwt = localStorage.getItem("jwt");
			if (storedJwt) {
				const parsedJwt = JSON.parse(storedJwt);
				const propertyDetails =
					parsedJwt?.user?.userWishList?.propertyDetails || [];

				// Build new map
				const newMap = {};
				propertyDetails.forEach((id) => {
					newMap[id] = true;
				});

				// Compare with existing wishlistMap to avoid re-setting if identical
				const keysNew = Object.keys(newMap);
				const keysOld = Object.keys(wishlistMap);

				let changed = false;
				if (keysNew.length !== keysOld.length) {
					changed = true;
				} else {
					for (let k of keysNew) {
						if (newMap[k] !== wishlistMap[k]) {
							changed = true;
							break;
						}
					}
				}

				if (changed) {
					setWishlistMap(newMap);
				}
			}
		} catch (err) {
			console.warn("Could not parse localStorage JWT:", err);
		}

		// Mark we've loaded for this user
		setLoadedForUserId(user._id);
		// Only run again if user._id changes
	}, [user, user?._id, loadedForUserId, wishlistMap]);

	/* ----------------------------------------------------------------
   | Early return if no properties
   ----------------------------------------------------------------*/
	if (!featuredProperties.length) {
		return null;
	}

	/* ----------------------------------------------------------------
   | Toggle wishlist
   ----------------------------------------------------------------*/
	const handleToggleWishlist = async (propertyId) => {
		// If not logged in => show modal
		if (!user) {
			setIsSignInForm(true);
			setSignInModalOpen(true);
			return;
		}

		try {
			const url = `${process.env.REACT_APP_API_URL}/property/${propertyId}/wishlist/${user._id}/${propertyId}`;
			const config = { headers: { Authorization: `Bearer ${token}` } };
			const res = await fetch(url, { method: "POST", headers: config.headers });
			const data = await res.json();
			const newInWishlist = data.inWishlist;

			setWishlistMap((prev) => ({ ...prev, [propertyId]: newInWishlist }));

			// Update localStorage
			const storedJwt = localStorage.getItem("jwt");
			if (storedJwt) {
				const parsedJwt = JSON.parse(storedJwt);
				if (!parsedJwt.user.userWishList) {
					parsedJwt.user.userWishList = { propertyDetails: [] };
				}
				if (!Array.isArray(parsedJwt.user.userWishList.propertyDetails)) {
					parsedJwt.user.userWishList.propertyDetails = [];
				}

				let propertyDetails = parsedJwt.user.userWishList.propertyDetails;
				if (newInWishlist) {
					if (!propertyDetails.includes(propertyId)) {
						propertyDetails.push(propertyId);
					}
					message.success("Added to your wishlist!");
				} else {
					propertyDetails = propertyDetails.filter((id) => id !== propertyId);
					parsedJwt.user.userWishList.propertyDetails = propertyDetails;
					message.error("Removed from your wishlist!");
				}
				localStorage.setItem("jwt", JSON.stringify(parsedJwt));
			}
		} catch (err) {
			console.error("Error toggling wishlist:", err);
		}
	};

	// Close sign-in / sign-up
	const handleModalClose = () => {
		setSignInModalOpen(false);
	};

	/* ----------------------------------------------------------------
   | Main slider (outer) settings
   ----------------------------------------------------------------*/
	const mainSliderSettings = {
		dots: false,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 4000,
		speed: 700,
		slidesToShow: 4,
		slidesToScroll: 1,
		pauseOnHover: true,
		pauseOnFocus: true,
		responsive: [
			{
				breakpoint: 1200, // Tablet
				settings: { slidesToShow: 3 },
			},
			{
				breakpoint: 768, // Phone
				settings: {
					slidesToShow: 1.5,
					slidesToScroll: 1,
					centerMode: false,
				},
			},
		],
	};

	// Go to single property
	const handleGoToProperty = (property) => {
		const { propertyState, _id, propertyName } = property;
		const slug = slugify(propertyName);
		window.location.href = `/single-property/${propertyState}/${slug}/${_id}`;
	};

	// Mark dragging
	const beforeChange = (propertyId) => {
		draggingRef.current[propertyId] = true;
	};
	const afterChange = (propertyId) => {
		draggingRef.current[propertyId] = false;
	};

	return (
		<FeaturedWrapper>
			{/* Sign-In / Sign-Up modal */}
			<Modal
				open={signInModalOpen}
				onCancel={handleModalClose}
				footer={null}
				title='Sign In / Sign Up'
			>
				<p>You must sign in or create an account to manage your wishlist.</p>

				{isSignInForm ? (
					<Signin
						signInModalOpen={signInModalOpen}
						setSignInModalOpen={setSignInModalOpen}
						onToggleSignIn={setIsSignInForm}
					/>
				) : (
					<Signup
						signInModalOpen={signInModalOpen}
						setSignInModalOpen={setSignInModalOpen}
						onToggleSignIn={setIsSignInForm}
					/>
				)}
			</Modal>

			<div className='featured-title'>
				<h2>Featured Properties</h2>
			</div>

			<div className='slider-container'>
				<Slider {...mainSliderSettings}>
					{featuredProperties.map((property) => {
						const {
							_id,
							propertyName,
							propertyPrice,
							propertyType,
							propertyAddress,
							propertyCity,
							propertyState,
							propertyCountry,
							currency,
							propertySize,
							propertyStatus,
						} = property;

						// gather images
						const allImages = getAllPropertyImages(property);
						const displayPrice = formatPrice(propertyPrice);
						const displayCurrency = formatCurrency(currency);

						// build address
						const addressParts = [
							propertyAddress,
							propertyCity,
							propertyState,
							propertyCountry,
						]
							.filter(Boolean)
							.join(", ");

						// in wishlist?
						const inWishlist = !!wishlistMap[_id];

						// subslider config
						const subSliderSettings = {
							dots: false,
							arrows: false,
							infinite: allImages.length > 1,
							autoplay: allImages.length > 1,
							autoplaySpeed: 4000,
							speed: 500,
							slidesToShow: 1,
							slidesToScroll: 1,
							swipeToSlide: true,
							draggable: true,
							pauseOnHover: true,
							pauseOnFocus: true,
							swipe: true,
							touchMove: true,
							beforeChange: () => beforeChange(_id),
							afterChange: () => afterChange(_id),
						};

						const sizeAvailable =
							propertySize && propertySize.size > 0 && propertySize.unit;

						return (
							<div key={_id} className='slide-padding'>
								<div className='property-card'>
									<div className='mini-carousel'>
										{/* Heart icon */}
										<HeartIcon
											inWishlist={inWishlist}
											onClick={(e) => {
												e.stopPropagation();
												handleToggleWishlist(_id);
											}}
										>
											<FaHeart />
										</HeartIcon>

										<Slider {...subSliderSettings}>
											{allImages.length > 0 ? (
												allImages.map((imageUrl, idx) => (
													<div
														key={idx}
														className='sub-slide'
														onClick={() => {
															if (!draggingRef.current[_id]) {
																handleGoToProperty(property);
															}
														}}
													>
														<img src={imageUrl} alt={`Property ${idx}`} />
													</div>
												))
											) : (
												<div
													className='sub-slide'
													onClick={() => {
														if (!draggingRef.current[_id]) {
															handleGoToProperty(property);
														}
													}}
												>
													<img
														src='https://via.placeholder.com/600x400?text=No+Image'
														alt='No Property Photos'
													/>
												</div>
											)}
										</Slider>
									</div>

									{/* property content */}
									<div
										className='property-content'
										onClick={() => handleGoToProperty(property)}
									>
										<h3>{propertyName || "N/A"}</h3>
										<p className='property-price'>
											Price: {displayPrice} {displayCurrency}
										</p>
										<p className='property-type'>
											Type: {propertyType || "N/A"}
										</p>
										<p className='property-status'>
											Status: For {propertyStatus || "N/A"}
										</p>
										{addressParts && (
											<p className='property-address'>
												Address: {addressParts}
											</p>
										)}
										{sizeAvailable && (
											<p className='property-size'>
												Size: {propertySize.size} {propertySize.unit}
											</p>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</Slider>
			</div>
		</FeaturedWrapper>
	);
};

export default Featured;

/* -------------- STYLED COMPONENTS -------------- */
const FeaturedWrapper = styled.section`
	background: #efe7de;
	padding: 3rem 0;

	.featured-title {
		text-align: center;
		margin-bottom: 2rem;
		h2 {
			color: var(--primary-color);
			font-size: 2rem;
			margin: 0;
			font-weight: bolder;
		}
	}

	.slider-container {
		width: 90%;
		max-width: 1300px;
		margin: 0 auto;
	}

	.slide-padding {
		padding: 0 5px;
	}

	.slick-list {
		margin: 0 -5px;
	}

	.slider-container .slick-track {
		display: flex !important;
		align-items: stretch !important;
	}
	.slider-container .slick-slide {
		display: flex !important;
		align-items: stretch !important;
		height: auto !important;
	}
	.slider-container .slick-slide > div {
		display: flex;
		width: 100%;
	}

	.property-card {
		background: var(--neutral-light);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--box-shadow-light);
		transition: var(--main-transition);
		min-height: 450px;
		display: flex;
		flex-direction: column;

		&:hover {
			box-shadow: var(--box-shadow-dark);
		}

		.mini-carousel {
			position: relative;
			width: 100%;
			height: 220px;
			overflow: hidden;
			.sub-slide {
				cursor: pointer;
				img {
					width: 100%;
					height: 220px;
					object-fit: cover;
					display: block;
				}
			}
			.slick-dots {
				display: none !important;
			}
			.slick-prev,
			.slick-next {
				display: none !important;
			}
		}

		.property-content {
			padding: 1rem;
			cursor: pointer;

			h3 {
				color: var(--text-color-dark);
				margin-bottom: 0.5rem;
				font-size: 1.2rem;
				text-transform: capitalize;
			}
			.property-price {
				color: var(--primary-color);
				margin-bottom: 0.25rem;
			}
			.property-type {
				color: var(--secondary-color);
				margin-bottom: 0.5rem;
				text-transform: capitalize;
			}
			.property-status {
				color: var(--secondary-color);
				margin-bottom: 0.5rem;
				text-transform: capitalize;
				font-weight: bold;
			}
			.property-address,
			.property-size {
				color: var(--text-color-dark);
				font-size: 0.95rem;
				margin-bottom: 0.25rem;
				text-transform: capitalize;
			}
		}
	}

	.slick-prev:before,
	.slick-next:before {
		color: var(--primary-color);
		font-size: 1.5rem;
	}

	.slick-slide {
		outline: none;
	}

	@media (max-width: 600px) {
		.property-content {
			h3 {
				font-size: 0.95rem !important;
				font-weight: bold;
			}
		}
	}
`;

const HeartIcon = styled.div`
	position: absolute;
	top: 8px;
	right: 8px;
	z-index: 2;
	font-size: 1.4rem;
	cursor: pointer;
	color: ${(props) => (props.inWishlist ? "darkred" : "#ccc")};
	transition: color 0.3s ease;

	&:hover {
		color: ${(props) => (props.inWishlist ? "#b30000" : "#888")};
	}
`;
