/** @format */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
// 1) Import both forms (Signin + Signup)
import Signup from "../components/SinglePropertyPage/Signup";
import Signin from "../components/SinglePropertyPage/Signin";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";

// React Icons
import {
	FaHeart,
	FaBath,
	FaBed,
	FaRulerCombined,
	FaBuilding,
	FaHome,
	FaCheckCircle,
	FaEye,
} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";

// Import arrays (including closeAreasList) from utils
import {
	propertyAmenitiesList,
	propertyViewsList,
	closeAreasList,
} from "../utils";

// AntD for Modal and message
import { Modal, message } from "antd";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

// Auth helper
import { isAuthenticated } from "../auth";

/** Helper to format large numbers with commas */
const formatNumber = (num) => {
	if (typeof num !== "number") return num;
	return num.toLocaleString("en-US");
};

/** Combine all property images (main + room photos) */
const getAllPropertyImages = (property) => {
	const mainPhotos = property?.propertyPhotos || [];
	let roomPhotos = [];
	if (property?.roomCountDetails?.length > 0) {
		roomPhotos = property.roomCountDetails
			.map((room) => room.photos || [])
			.flat();
	}
	return [...mainPhotos, ...roomPhotos];
};

// Slick settings for small (room photos) slider
const miniSliderSettings = {
	dots: true,
	arrows: true,
	infinite: false,
	speed: 500,
	slidesToShow: 1,
	slidesToScroll: 1,
};

const SinglePropertyPage = () => {
	const { propertyId } = useParams();

	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Google Map loaded
	const [mapLoaded, setMapLoaded] = useState(false);

	// Lightbox modal for images
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	// Sign-in prompt if user not logged in
	const [signInModalOpen, setSignInModalOpen] = useState(false);

	// Toggle between Signin or Signup forms in the modal
	const [isSignInForm, setIsSignInForm] = useState(false);

	// If user is authenticated
	const { user, token } = isAuthenticated() || {};

	// Track if property is in the wishlist
	const [inWishlist, setInWishlist] = useState(false);

	// “bounce in” animation on mount
	const [mountAnimation, setMountAnimation] = useState(true);

	// Additional animation when adding to wishlist
	const [wishlistAnimation, setWishlistAnimation] = useState(false);

	// Responsive width for the ImageGallery modal
	const [modalWidth, setModalWidth] = useState("75%");

	// Dynamically handle modal width on resize
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth <= 768) {
				setModalWidth("90%");
			} else {
				setModalWidth("75%");
			}
		};
		handleResize(); // check once
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		const fetchPropertyDetails = async () => {
			setLoading(true);
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/property-details/${propertyId}`
				);
				setProperty(res.data);
				// If your backend returns a boolean isInWishlist, e.g.:
				// setInWishlist(!!res.data.isInWishlist);
			} catch (err) {
				console.error("Error fetching property details:", err);
				setError("Failed to fetch property details.");
			} finally {
				setLoading(false);
			}
		};
		fetchPropertyDetails();

		// End bounce-in after ~0.8s
		const timer = setTimeout(() => {
			setMountAnimation(false);
		}, 800);
		return () => clearTimeout(timer);
	}, [propertyId]);

	if (loading) {
		return <LoadingWrapper>Loading property details...</LoadingWrapper>;
	}
	if (error) {
		return <ErrorWrapper>{error}</ErrorWrapper>;
	}
	if (!property) {
		return <NoDataWrapper>No Property Found.</NoDataWrapper>;
	}

	// Destructure fields
	const {
		propertyName,
		propertyName_OtherLanguage,
		propertyStatus,
		propertyAddress,
		propertyFloors,
		overallRoomsCount,
		bathRoomsCount,
		propertySize,
		propertyPrice,
		currency,
		aboutProperty,
		aboutPropertyOtherLanguange,
		propertyType,
		phone,
		amenities,
		views,
		closeAreas,
		roomCountDetails,
		location,
	} = property;

	// lat / lng
	const lat = location?.coordinates?.[1];
	const lng = location?.coordinates?.[0];

	// Format property size
	const sizeValue = propertySize?.size || 0;
	const sizeUnit = propertySize?.unit || "square meter";

	// Currency symbol
	const getCurrencySymbol = (cur) => {
		if (!cur) return "";
		if (cur.toLowerCase() === "rupee") return "₹";
		return cur[0].toUpperCase() + cur.slice(1).toLowerCase();
	};
	const currencySymbol = getCurrencySymbol(currency);

	// Combine all images
	const allPhotos = getAllPropertyImages(property);

	// Main slider settings
	const mainSliderSettings = {
		dots: true,
		infinite: true,
		speed: 600,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: false,
		arrows: true,
		adaptiveHeight: true,
	};

	// Prepare images for lightbox
	const galleryImages =
		allPhotos.length > 0
			? allPhotos.map((photo) => ({
					original: photo.url,
					thumbnail: photo.url,
					originalAlt: propertyName || "Property Photo",
					thumbnailAlt: propertyName || "Property Photo",
				}))
			: [
					{
						original: "https://via.placeholder.com/1200x700?text=No+Available",
						thumbnail: "https://via.placeholder.com/120x70?text=No+Img",
					},
				];

	// Lightbox controls
	const handleOpenLightbox = (index) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};
	const handleCloseLightbox = () => {
		setLightboxOpen(false);
	};

	// Wishlist click
	const handleWishlistClick = async () => {
		if (!user) {
			// prompt sign in => show Sign In form
			setIsSignInForm(true);
			setSignInModalOpen(true);
			return;
		}
		try {
			const url = `${process.env.REACT_APP_API_URL}/property/${propertyId}/wishlist/${user._id}/${propertyId}`;
			const config = { headers: { Authorization: `Bearer ${token}` } };
			const res = await axios.post(url, {}, config);

			// The new inWishlist state from backend
			const newInWishlist = res.data.inWishlist;
			setInWishlist(newInWishlist);

			// Show success or danger message
			if (newInWishlist) {
				message.success("Property was successfully added to your wishlist!");
				setWishlistAnimation(true);
				setTimeout(() => setWishlistAnimation(false), 700);
			} else {
				message.error("Property was removed from your wishlist.");
			}
		} catch (err) {
			console.error("Wishlist toggle error:", err);
		}
	};

	// Close the sign-in / sign-up modal
	const handleModalClose = () => {
		setSignInModalOpen(false);
	};

	return (
		<PageWrapper>
			{/* MAIN IMAGE CAROUSEL */}
			<CarouselSection>
				<Slider {...mainSliderSettings}>
					{allPhotos.length > 0 ? (
						allPhotos.map((photo, idx) => (
							<div
								className='image-slide'
								key={idx}
								onClick={() => handleOpenLightbox(idx)}
							>
								<img src={photo.url} alt={`Slide ${idx + 1}`} />
							</div>
						))
					) : (
						<div className='image-slide'>
							<img
								src='https://via.placeholder.com/1200x700?text=No+Available'
								alt='Slide'
							/>
						</div>
					)}
				</Slider>
			</CarouselSection>

			{/* Lightbox Modal */}
			<Modal
				open={lightboxOpen}
				onCancel={handleCloseLightbox}
				footer={null}
				width={modalWidth}
				style={{ top: "10px" }}
				bodyStyle={{ padding: 0 }}
			>
				<ImageGalleryWrapper>
					<ImageGallery
						items={galleryImages}
						startIndex={lightboxIndex}
						showThumbnails={true}
						showFullscreenButton={false}
						showPlayButton={false}
					/>
				</ImageGalleryWrapper>
			</Modal>

			{/* Sign-In / Sign-Up prompt modal */}
			<Modal
				open={signInModalOpen}
				onCancel={handleModalClose}
				footer={null}
				title='Sign In / Sign Up'
			>
				<p>
					You must sign in or create an account to add this property to your
					wishlist.
				</p>

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

			{/* PROPERTY OVERVIEW */}
			<PropertyOverviewSection>
				<TitleRow>
					<div className='title-col'>
						<h1 className='property-title'>
							{propertyName}{" "}
							{propertyName_OtherLanguage && (
								<span className='secondary-title'>
									({propertyName_OtherLanguage})
								</span>
							)}
						</h1>

						{/* Wishlist Block */}
						<WishlistBlock>
							<AddWishLabel>
								<strong>Add To Wish List!</strong>
							</AddWishLabel>

							<HeartIcon
								onClick={handleWishlistClick}
								className={`${mountAnimation ? "bounce-in" : ""} ${
									wishlistAnimation ? "pulse" : ""
								}`}
								title='Toggle Wish List'
							>
								<FaHeart
									style={{
										fill: inWishlist ? "darkred" : "darkgrey",
									}}
								/>
							</HeartIcon>

							{/* Stats Row (Views, Wishlisted) */}
							<StatsRow>
								<StatsItem>
									<FaEye style={{ fill: "var(--primary-color-light)" }} />
									<span>Views: 23</span>
								</StatsItem>
								<StatsItem>
									<FaHeart style={{ fill: "var(--secondary-color)" }} />
									<span>Added To Wishlist: 10</span>
								</StatsItem>
							</StatsRow>
						</WishlistBlock>
					</div>
				</TitleRow>

				{/* Basic meta row */}
				<MetaRow>
					<MetaItem>
						<MetaIcon color='var(--secondary-color)'>
							<FaCheckCircle />
						</MetaIcon>
						<span>
							<strong>Property Status:</strong> {propertyStatus || "N/A"}
						</span>
					</MetaItem>

					<MetaItem>
						<MetaIcon color='var(--secondary-color)'>
							<FaHome />
						</MetaIcon>
						<span>
							<strong>Type:</strong> {propertyType || "N/A"}
						</span>
					</MetaItem>
				</MetaRow>

				{/* Another meta row */}
				<MetaRow>
					<MetaItem>
						<MetaIcon color='var(--primary-color-light)'>
							<FaBuilding />
						</MetaIcon>
						<span>
							<strong>Floors:</strong> {propertyFloors || "N/A"}
						</span>
					</MetaItem>
					<MetaItem>
						<MetaIcon color='var(--secondary-color)'>
							<FaBed />
						</MetaIcon>
						<span>
							<strong>Bedrooms:</strong> {overallRoomsCount || "N/A"}
						</span>
					</MetaItem>
					<MetaItem>
						<MetaIcon color='var(--secondary-color)'>
							<FaBath />
						</MetaIcon>
						<span>
							<strong>Bathrooms:</strong> {bathRoomsCount || "N/A"}
						</span>
					</MetaItem>
					<MetaItem>
						<MetaIcon color='var(--primary-color-light)'>
							<FaRulerCombined />
						</MetaIcon>
						<span>
							<strong>Size:</strong>{" "}
							{sizeValue > 0
								? `${formatNumber(sizeValue)} ${sizeUnit}`
								: "Not specified"}
						</span>
					</MetaItem>
				</MetaRow>

				<PriceWrapper>
					{propertyPrice ? (
						<>
							<PriceValue>{formatNumber(propertyPrice)}</PriceValue>
							{currencySymbol && <CurrencySpan>{currencySymbol}</CurrencySpan>}
						</>
					) : (
						<span>Price Not Specified</span>
					)}
				</PriceWrapper>

				{propertyAddress && (
					<AddressWrapper>
						<label>Address:</label> {propertyAddress}
					</AddressWrapper>
				)}
				{phone && (
					<ContactWrapper>
						<label>Contact Phone:</label> <span>{phone}</span>
					</ContactWrapper>
				)}
			</PropertyOverviewSection>

			{/* ABOUT */}
			<SectionWrapper>
				<SectionTitle>About This Property</SectionTitle>
				<div className='about-content'>
					<p className='english'>
						{aboutProperty
							? aboutProperty.charAt(0).toUpperCase() + aboutProperty.slice(1)
							: "No information provided."}
					</p>
					{aboutPropertyOtherLanguange && (
						<p className='hindi'>
							<strong>Other Language:</strong> {aboutPropertyOtherLanguange}
						</p>
					)}
				</div>
			</SectionWrapper>

			{/* AMENITIES & VIEWS */}
			<SectionWrapper>
				<SectionTitle>Amenities & Views</SectionTitle>
				<RowWrapper>
					<Column>
						<h4>Amenities</h4>
						{amenities && amenities.length > 0 ? (
							<ChipList>
								{amenities.map((amen, idx) => {
									const found = propertyAmenitiesList.find(
										(itm) => itm.label.toLowerCase() === amen.toLowerCase()
									);
									return (
										<div className='chip' key={idx}>
											{found?.icon || <AiOutlineInfoCircle />}{" "}
											<span>{amen}</span>
										</div>
									);
								})}
							</ChipList>
						) : (
							<EmptyNote>No amenities specified.</EmptyNote>
						)}
					</Column>
					<Column>
						<h4>Views</h4>
						{views && views.length > 0 ? (
							<ChipList>
								{views.map((v, idx) => {
									const found = propertyViewsList.find(
										(itm) => itm.label.toLowerCase() === v.toLowerCase()
									);
									return (
										<div className='chip' key={idx}>
											{found?.icon || <AiOutlineInfoCircle />} <span>{v}</span>
										</div>
									);
								})}
							</ChipList>
						) : (
							<EmptyNote>No views specified.</EmptyNote>
						)}
					</Column>
				</RowWrapper>
			</SectionWrapper>

			{/* ROOMS */}
			<SectionWrapper>
				<SectionTitle>Room Details</SectionTitle>
				{roomCountDetails && roomCountDetails.length > 0 ? (
					roomCountDetails.map((room, idx) => (
						<RoomCard key={idx}>
							<div className='top-row'>
								<span className='roomType'>
									{room.roomType || "Room"} (x{room.count || 1})
								</span>
								{room.roomSize && (
									<span className='roomSize'>
										{room.roomSize} m<sup>2</sup>
									</span>
								)}
							</div>
							<div className='displayName'>
								<strong>{room.displayName}</strong>
								{room.displayName_OtherLanguage && (
									<span style={{ marginLeft: "6px", color: "var(--darkGrey)" }}>
										({room.displayName_OtherLanguage})
									</span>
								)}
							</div>
							{(room.description || room.description_OtherLanguage) && (
								<div className='desc'>
									{room.description && (
										<p>
											{room.description.charAt(0).toUpperCase() +
												room.description.slice(1)}
										</p>
									)}
									{room.description_OtherLanguage && (
										<p
											style={{
												fontStyle: "italic",
												color: "var(--darkGrey)",
											}}
										>
											(Other) {room.description_OtherLanguage}
										</p>
									)}
								</div>
							)}
							{room.photos && room.photos.length > 0 && (
								<div className='room-photos'>
									<Slider {...miniSliderSettings}>
										{room.photos.map((ph, i) => (
											<div className='mini-img-slide' key={i}>
												<img src={ph.url} alt={`Room slide ${i + 1}`} />
											</div>
										))}
									</Slider>
								</div>
							)}
						</RoomCard>
					))
				) : (
					<EmptyNote>No room details available.</EmptyNote>
				)}
			</SectionWrapper>

			{/* CLOSE AREAS */}
			<SectionWrapper>
				<SectionTitle>Close Areas</SectionTitle>
				{closeAreas && closeAreas.length > 0 ? (
					<ul className='close-areas'>
						{closeAreas.map((area, idx) => {
							/**
							 * Substring match:
							 * if closeAreasList[label] is contained in area, ignoring case,
							 * use the icon. Otherwise just the text.
							 */
							const found = closeAreasList.find((item) =>
								area.toLowerCase().includes(item.label.toLowerCase())
							);
							return (
								<li key={idx}>
									{found ? (
										<>
											{found.icon}{" "}
											<span style={{ marginLeft: "4px" }}>{area}</span>
										</>
									) : (
										area
									)}
								</li>
							);
						})}
					</ul>
				) : (
					<EmptyNote>No close areas specified.</EmptyNote>
				)}
			</SectionWrapper>

			{/* MAP SECTION */}
			<SectionWrapper>
				<SectionTitle>Location</SectionTitle>
				{lat && lng ? (
					<MapContainer>
						<LoadScript
							googleMapsApiKey={process.env.REACT_APP_MAPS_API_KEY || ""}
							onLoad={() => setMapLoaded(true)}
						>
							{mapLoaded && (
								<GoogleMap
									mapContainerStyle={{ width: "100%", height: "100%" }}
									center={{ lat: lat, lng: lng }}
									zoom={14}
								>
									<MarkerF position={{ lat: lat, lng: lng }} />
								</GoogleMap>
							)}
						</LoadScript>
					</MapContainer>
				) : (
					<EmptyNote>No location data provided for this property.</EmptyNote>
				)}
			</SectionWrapper>
		</PageWrapper>
	);
};

export default SinglePropertyPage;

/* --------------------------- STYLED COMPONENTS --------------------------- */

// Main Container
const PageWrapper = styled.div`
	width: 100%;
	margin: 0 auto;
	padding-bottom: 2rem;
	background: var(--mainWhite);
	color: var(--text-color-primary);

	/* Ensure images never overflow horizontally on small screens */
	img {
		max-width: 100%;
		height: auto;
		display: block;
	}

	ul {
		list-style: none;
		padding-left: 1.25rem; /* optional indentation */
	}

	@media (min-width: 1200px) {
		max-width: 1200px;
	}

	@media (max-width: 600px) {
		h1.property-title {
			font-size: 1.4rem;
		}
		h2 {
			font-size: 1.25rem;
		}
		p,
		li {
			font-size: 0.95rem;
		}
		label {
			font-size: 0.95rem;
		}
	}
`;

// Wrapper for ImageGallery on small screens
const ImageGalleryWrapper = styled.div`
	@media (max-width: 768px) {
		.image-gallery-slide img {
			width: 100% !important;
			height: 300px !important;
			object-fit: cover !important;
		}
	}
`;

// Loading / Error / NoData
const LoadingWrapper = styled.div`
	padding: 2rem;
	text-align: center;
	font-size: 1.2rem;
`;
const ErrorWrapper = styled.div`
	padding: 2rem;
	text-align: center;
	color: red;
	font-weight: bold;
`;
const NoDataWrapper = styled.div`
	padding: 2rem;
	text-align: center;
	color: var(--darkGrey);
`;

/** --- MAIN CAROUSEL SECTION --- */
const CarouselSection = styled.section`
	position: relative;

	/* Position .slick-slider so arrows can overlap without overflow */
	.slick-slider {
		position: relative;
	}

	.slick-prev,
	.slick-next {
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		width: 40px;
		height: 40px;
		background: rgba(0, 0, 0, 0.4);
		color: #fff;
		border-radius: 4px;
		display: flex !important;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
		transition: opacity 0.3s ease;
		cursor: pointer;
	}

	.slick-prev:hover,
	.slick-next:hover {
		opacity: 1;
	}

	.slick-prev {
		left: 10px;
	}
	.slick-next {
		right: 10px;
	}

	.slick-prev:before,
	.slick-next:before {
		font-family: "slick";
		font-size: 20px;
		line-height: 1;
		opacity: 1;
		color: #fff;
	}

	.image-slide {
		cursor: pointer;
		img {
			width: 100%;
			height: 60vh;
			object-fit: cover;
			@media (max-width: 768px) {
				height: 40vh;
			}
		}
	}
`;

/* BOUNCE-IN animation for the heart icon */
const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
`;

/* PULSE animation for when a user adds the item to the wishlist */
const pulse = keyframes`
  0% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
`;

// PROPERTY OVERVIEW
const PropertyOverviewSection = styled.section`
	padding: 1.5rem;
	border-bottom: 1px solid var(--border-color-light);

	.property-title {
		font-size: 2rem;
		color: var(--primary-color-dark);
		text-transform: capitalize;
		margin-bottom: 0.3rem;

		.secondary-title {
			font-size: 1.2rem;
			color: var(--darkGrey);
			margin-left: 6px;
		}
	}
`;

const TitleRow = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1rem;
`;

/** Wishlist container */
const WishlistBlock = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.3rem;
	margin-top: 0.5rem;
`;

const AddWishLabel = styled.span`
	font-size: 1rem;
	color: var(--neutral-dark2);
	font-weight: bolder;
	text-transform: uppercase;
	font-style: italic;
`;

const HeartIcon = styled.div`
	cursor: pointer;
	font-size: 2rem;

	&.bounce-in {
		animation: ${bounceIn} 0.8s forwards ease-in-out;
	}
	&.pulse {
		animation: ${pulse} 0.7s forwards ease-in-out;
	}

	svg {
		font-size: 2rem;
	}
`;

const StatsRow = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	margin-top: 0.4rem;
`;

const StatsItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.3rem;
	font-size: 0.9rem;
	color: var(--text-color-secondary);

	svg {
		font-size: 1rem;
	}
`;

const MetaRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 0.75rem;
`;

const MetaItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.4rem;
	background: var(--neutral-light);
	padding: 0.5rem 0.7rem;
	border-radius: 6px;

	span {
		strong {
			margin-right: 4px;
			color: var(--text-color-primary);
		}
		color: var(--darkGrey);
	}
`;

const MetaIcon = styled.div`
	font-size: 1.2rem;
	color: ${(props) => props.color || "var(--primary-color-light)"};
	display: flex;
	align-items: center;
`;

const PriceWrapper = styled.div`
	font-size: 1.8rem;
	font-weight: bold;
	color: var(--secondary-color);
	margin-bottom: 0.5rem;
`;

const PriceValue = styled.span`
	margin-right: 0.3rem;
`;

const CurrencySpan = styled.span`
	font-size: 1.2rem;
`;

const AddressWrapper = styled.div`
	margin-bottom: 0.3rem;
	label {
		font-weight: 600;
		text-transform: capitalize;
		margin-right: 5px;
	}
`;
const ContactWrapper = styled.div`
	margin-bottom: 0.3rem;
	label {
		font-weight: 600;
		text-transform: capitalize;
		margin-right: 5px;
	}
	span {
		color: var(--primaryBlue);
	}
`;

// Shared Section
const SectionWrapper = styled.section`
	padding: 1.5rem;
	border-bottom: 1px solid var(--border-color-light);
	&:last-of-type {
		border-bottom: none;
	}

	.about-content {
		font-size: 1rem;
		line-height: 1.6;
		.hindi {
			margin-top: 0.5rem;
			color: var(--darkGrey);
		}
	}
`;

const SectionTitle = styled.h2`
	font-size: 1.5rem;
	margin-bottom: 1rem;
	color: var(--primary-color-dark);
	text-transform: capitalize;
`;

/** Amenities & Views layout */
const RowWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2rem;

	@media (min-width: 768px) {
		flex-direction: row;
	}
`;

const Column = styled.div`
	flex: 1;
	h4 {
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		color: var(--primary-color);
		text-transform: capitalize;
	}
`;

const ChipList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;

	.chip {
		display: inline-flex;
		align-items: center;
		background-color: var(--neutral-light2);
		color: var(--primaryBlue);
		border-radius: 16px;
		padding: 0.4rem 0.8rem;
		font-size: 0.9rem;

		svg {
			margin-right: 4px;
		}
	}
`;

const EmptyNote = styled.div`
	font-size: 0.95rem;
	color: var(--darkGrey);
	font-style: italic;
`;

/** Rooms */
const RoomCard = styled.div`
	margin-bottom: 1rem;
	padding: 1rem;
	border: 1px solid var(--border-color-light);
	border-radius: 6px;
	background-color: var(--neutral-light2);

	.top-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;

		.roomType {
			font-weight: bold;
			color: var(--primary-color-dark);
			text-transform: capitalize;
		}
		.roomSize {
			font-size: 0.9rem;
			font-weight: 600;
			color: var(--secondary-color);
		}
	}

	.displayName {
		margin-bottom: 0.5rem;
		color: var(--primary-color-dark);
		strong {
			font-size: 1rem;
			text-transform: capitalize;
		}
	}

	.desc {
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
		p {
			margin-bottom: 0.3rem;
		}
	}

	.room-photos {
		margin-top: 0.5rem;
		.mini-img-slide {
			img {
				width: 100%;
				height: 250px;
				object-fit: cover;
				border-radius: 4px;
			}
		}
	}
`;

/** Map styling */
const MapContainer = styled.div`
	width: 100%;
	height: 450px;
	margin-top: 1rem;
`;
