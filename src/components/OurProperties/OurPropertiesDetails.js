/** @format */
// src/components/AgentPuplicPage/OurPropertiesDetails.jsx

import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { Modal } from "antd";
import { LoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";

// Image Gallery
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

// Icons
import { AiOutlineInfoCircle } from "react-icons/ai";
import {
	FaMapMarkerAlt,
	FaBuilding,
	FaBed,
	FaBath,
	FaRulerCombined,
} from "react-icons/fa";

// Amenity & Views arrays:
import { propertyAmenitiesList, propertyViewsList } from "../../utils";
import { storeLatestViewedProperty } from "../../apiCore";

/* ------------------ Helper Functions ------------------ */

// Combine property + room photos
function getAllPropertyImages(property = {}) {
	const mainPhotos = property.propertyPhotos || [];
	let roomPhotos = [];
	if (property.roomCountDetails?.length > 0) {
		roomPhotos = property.roomCountDetails
			.map((room) => room.photos || [])
			.flat();
	}
	return [...mainPhotos, ...roomPhotos];
}

function slugify(str = "") {
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "");
}

function formatPrice(price) {
	if (price == null) return "N/A";
	return price.toLocaleString("en-US");
}

function formatCurrency(currency = "") {
	if (!currency) return "";
	if (currency.toLowerCase() === "rupee") return "₹";
	return currency[0].toUpperCase() + currency.slice(1).toLowerCase();
}

function formatNumber(num) {
	if (typeof num !== "number") return num;
	return num.toLocaleString("en-US");
}

// Return the correct icon for an amenity or view label
function getIconForFeature(feature = "") {
	const lowered = feature.toLowerCase();
	const foundAmenity = propertyAmenitiesList.find(
		(item) => item.label.toLowerCase() === lowered
	);
	if (foundAmenity) return foundAmenity.icon;

	const foundView = propertyViewsList.find(
		(item) => item.label.toLowerCase() === lowered
	);
	if (foundView) return foundView.icon;

	return <AiOutlineInfoCircle />;
}

const OurPropertiesDetails = ({ properties = [] }) => {
	const history = useHistory();

	// Single map modal for all rows
	const [showMapModal, setShowMapModal] = useState(false);
	const [selectedProperty, setSelectedProperty] = useState(null);

	if (!properties.length) {
		return (
			<NoPropertiesWrapper className='container my-4'>
				<h2>No active properties</h2>
			</NoPropertiesWrapper>
		);
	}

	// Navigate to single property
	const goToSingleProperty = (property) => {
		storeLatestViewedProperty(property._id);

		const { _id, propertyState, propertyName } = property;
		const slug = slugify(propertyName || "");
		history.push(`/single-property/${propertyState}/${slug}/${_id}`);
	};

	// "Show on map" => open modal
	const handleShowMap = (e, property) => {
		e.stopPropagation();
		setSelectedProperty(property);
		setShowMapModal(true);
	};

	// close map
	const handleCloseMap = () => {
		setShowMapModal(false);
		setSelectedProperty(null);
	};

	return (
		<PropertiesWrapper className='container my-4'>
			{properties.map((property) => {
				const {
					_id,
					propertyName,
					propertyPrice,
					currency,
					propertyType,
					propertyStatus,
					propertyAddress,
					propertyCity,
					propertyState,
					propertyCountry,
					propertyFloors,
					overallRoomsCount,
					bathRoomsCount,
					propertySize,
					amenities,
					views,
				} = property;

				// Gather images => react-image-gallery items
				const allImages = getAllPropertyImages(property);
				const galleryItems = allImages.length
					? allImages.map((img) => ({
							original: img.url,
							thumbnail: img.url,
							originalAlt: propertyName || "Property Photo",
							thumbnailAlt: propertyName || "Property Thumbnail",
						}))
					: [
							{
								original: "https://via.placeholder.com/600x400?text=No+Image",
								thumbnail: "https://via.placeholder.com/120x80?text=No+Thumb",
							},
						];

				// Address
				const addressParts = [
					propertyAddress,
					propertyCity,
					propertyState,
					propertyCountry,
				]
					.filter(Boolean)
					.join(", ");

				// Price
				const displayPrice = formatPrice(propertyPrice);
				const displayCurrency = formatCurrency(currency);

				// floors/beds/baths/size
				const floors = propertyFloors || 0;
				const bedrooms = overallRoomsCount || 0;
				const bathrooms = bathRoomsCount || 0;
				const sizeValue = propertySize?.size || 0;
				const sizeUnit = propertySize?.unit || "square meter";
				const sizeDisplay =
					sizeValue > 0
						? `${formatNumber(sizeValue)} ${sizeUnit}`
						: "Not specified";

				// amenities & views
				const combinedFeatures = [...(amenities || []), ...(views || [])];

				// Called when the user clicks on the big image (not swiping)
				const onImageClick = () => {
					// Navigate to single property
					goToSingleProperty(property);
				};

				return (
					<PropertyRow key={_id} className='row mb-4'>
						{/* LEFT => ImageGallery with the 6 requested changes */}
						<LeftCol className='col-12 col-md-4'>
							<GalleryContainer>
								<ImageGallery
									items={galleryItems}
									showThumbnails
									showPlayButton={false}
									showFullscreenButton={false}
									showIndex={false}
									showNav={false} /* (1) hide arrows */
									infinite={true} /* (3) infinite loop */
									slideDuration={350}
									thumbnailPosition='bottom'
									additionalClass='custom-image-gallery'
									/* 
                    (2) swiping is enabled by default in ImageGallery
                    (6) onClick => we differentiate from swipe by default 
                        if the user actually taps the image 
                        (not dragging), onImageClick fires
                  */
									onClick={onImageClick}
								/>
							</GalleryContainer>
						</LeftCol>

						{/* RIGHT => property details + row click */}
						<RightCol
							className='col-12 col-md-8'
							onClick={() => goToSingleProperty(property)}
						>
							<DetailsWrapper>
								<h3 className='property-name'>{propertyName || "N/A"}</h3>
								<div className='property-price'>
									{displayPrice} {displayCurrency}
								</div>
								<div className='property-type'>
									Type: {propertyType || "N/A"}
								</div>
								<div className='property-status'>
									Status: For {propertyStatus || "N/A"}
								</div>

								{/* Floors / bedrooms / bathrooms / size */}
								<MetaRow>
									<MetaItem>
										<MetaIcon>
											<FaBuilding />
										</MetaIcon>
										<span>
											<strong>Floors:</strong> {floors || "N/A"}
										</span>
									</MetaItem>
									<MetaItem>
										<MetaIcon>
											<FaBed />
										</MetaIcon>
										<span>
											<strong>Bedrooms:</strong> {bedrooms || "N/A"}
										</span>
									</MetaItem>
									<MetaItem>
										<MetaIcon>
											<FaBath />
										</MetaIcon>
										<span>
											<strong>Bathrooms:</strong> {bathrooms || "N/A"}
										</span>
									</MetaItem>
									<MetaItem>
										<MetaIcon>
											<FaRulerCombined />
										</MetaIcon>
										<span>
											<strong>Size:</strong> {sizeDisplay}
										</span>
									</MetaItem>
								</MetaRow>

								{addressParts && (
									<div className='property-address'>{addressParts}</div>
								)}

								<FeaturesTitle>Amenities & Views</FeaturesTitle>
								{combinedFeatures.length > 0 ? (
									<AmenitiesRow>
										{combinedFeatures.map((feature, idx) => {
											const icon = getIconForFeature(feature);
											return (
												<AmenityChip key={idx}>
													{icon} <span>{feature}</span>
												</AmenityChip>
											);
										})}
									</AmenitiesRow>
								) : (
									<NoAmenities>(No amenities/views specified)</NoAmenities>
								)}

								{/* bottom row => schedule appt + map button */}
								<BottomRow>
									<AppointmentLink>
										<strong>Schedule an Appointment</strong>
									</AppointmentLink>
									<MapButton
										onClick={(e) => {
											e.stopPropagation();
											handleShowMap(e, property);
										}}
										className='btn btn-sm btn-outline-primary'
									>
										<FaMapMarkerAlt /> Show on The Map...
									</MapButton>
								</BottomRow>
							</DetailsWrapper>
						</RightCol>
					</PropertyRow>
				);
			})}

			{/* Single map modal */}
			<Modal
				open={showMapModal}
				onCancel={handleCloseMap}
				footer={null}
				destroyOnClose
				width={"85%"}
				title={
					selectedProperty ? (
						<div style={{ textTransform: "capitalize" }}>
							Map Location: {selectedProperty.propertyName}
						</div>
					) : (
						"Map Location"
					)
				}
			>
				{selectedProperty && selectedProperty.location?.coordinates ? (
					<MapContainer>
						<LoadScript
							googleMapsApiKey={process.env.REACT_APP_MAPS_API_KEY || ""}
						>
							<GoogleMap
								mapContainerStyle={{ width: "100%", height: "100%" }}
								center={{
									lat: selectedProperty.location.coordinates[1],
									lng: selectedProperty.location.coordinates[0],
								}}
								zoom={14}
							>
								<MarkerF
									position={{
										lat: selectedProperty.location.coordinates[1],
										lng: selectedProperty.location.coordinates[0],
									}}
								/>
							</GoogleMap>
						</LoadScript>
					</MapContainer>
				) : (
					<p>No valid coordinates for this property.</p>
				)}
			</Modal>
		</PropertiesWrapper>
	);
};

export default OurPropertiesDetails;

/* ------------------ STYLED COMPONENTS ------------------ */
const NoPropertiesWrapper = styled.div`
	min-height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const PropertiesWrapper = styled.div``;

/**
 * The entire "row" container
 * Removed extra border/padding so the image meets edges
 */
const PropertyRow = styled.div`
	background: #fff;
	border-radius: 8px;
	box-shadow: var(--box-shadow-light);
	transition: box-shadow 0.3s ease;
	margin: 0 auto;
	cursor: pointer;
	&:hover {
		box-shadow: var(--box-shadow-dark);
	}
`;

/**
 * Left column: No extra padding so no white space above/around images
 */
const LeftCol = styled.div`
	padding: 0;
	/* Force the left corners to match the card rounding */
	border-top-left-radius: 8px;
	border-bottom-left-radius: 8px;
	overflow: hidden;
`;

/**
 * Right column: Also no extra margin or padding
 * so they meet the top/right edges
 */
const RightCol = styled.div`
	padding: 0;
	border-top-right-radius: 8px;
	border-bottom-right-radius: 8px;
	overflow: hidden;
`;

/**
 * Container for the ImageGallery
 * (5) no extra white space => remove default padding
 */
const GalleryContainer = styled.div`
	.custom-image-gallery {
		/* Remove default 1rem padding from react-image-gallery if needed */
		.image-gallery-content {
			padding: 0 !important;
			margin: 0;
		}

		/* 1) Hide arrows */
		.image-gallery-left-nav,
		.image-gallery-right-nav {
			display: none !important;
		}

		/* 2) Swipe is default. 3) infinite is default. */

		.image-gallery-slide img {
			object-fit: cover;
			width: 100%;
			height: 250px; /* Adjust as you like */
		}

		/* 4) Customize thumbnail border => 2px normal, 3px active */
		.image-gallery-thumbnail {
			border: 2px solid #ccc; /* default */
			transition: border 0.2s;
			&.active,
			&.active > div {
				border: 3px solid #555 !important;
			}
		}

		.image-gallery-thumbnail img {
			object-fit: cover;
			height: 60px;
		}
	}
`;

/* Right side details container */
const DetailsWrapper = styled.div`
	padding: 1rem;

	.property-name {
		font-size: 1.25rem;
		margin-bottom: 0.2rem;
		color: var(--primary-color-dark);
		text-transform: capitalize;
	}
	.property-price {
		font-size: 1.2rem;
		font-weight: bold;
		color: #ec1c24;
		margin-bottom: 0.3rem;
	}
	.property-type,
	.property-status {
		color: #444;
		font-size: 0.95rem;
		margin-bottom: 0.2rem;
		text-transform: capitalize;
		font-weight: 500;
	}
	.property-address {
		color: #555;
		font-size: 0.95rem;
		margin-top: 0.4rem;
		margin-bottom: 0.6rem;
	}
`;

/* Floors/Bedrooms/Baths/Size row */
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
	color: var(--secondary-color);
	display: flex;
	align-items: center;
`;

/* Amenities & Views Title */
const FeaturesTitle = styled.h4`
	margin: 0.5rem 0 0.3rem;
	font-size: 1rem;
	color: var(--primary-color-dark);
	text-transform: uppercase;
`;

/* Amenities list */
const AmenitiesRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 0.6rem;
`;

const AmenityChip = styled.div`
	display: inline-flex;
	align-items: center;
	background-color: var(--neutral-light2);
	color: var(--primaryBlue);
	border-radius: 16px;
	padding: 0.3rem 0.6rem;
	font-size: 0.85rem;
	font-weight: 500;

	svg {
		margin-right: 4px;
	}
`;

const NoAmenities = styled.div`
	font-size: 0.9rem;
	font-style: italic;
	color: #777;
	margin-bottom: 0.6rem;
`;

/* Bottom row => schedule appt + show map */
const BottomRow = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	margin-top: 0.8rem;
`;

const AppointmentLink = styled.span`
	font-size: 1rem;
	color: var(--secondary-color);
	text-decoration: underline;
	cursor: pointer;
	&:hover {
		color: var(--secondary-color-dark);
	}
`;

const MapButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;

	svg {
		font-size: 1rem;
	}
`;

/* Map modal container */
const MapContainer = styled.div`
	width: 100%;
	height: 500px;
`;
