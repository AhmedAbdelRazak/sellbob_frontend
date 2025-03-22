/** @format */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { InfoCircleOutlined } from "@ant-design/icons";

// Helper to format large numbers with commas
const formatNumber = (num) => {
	if (typeof num !== "number") return num;
	return num.toLocaleString("en-US");
};

// Mini slider settings for room photos
const miniSliderSettings = {
	dots: true,
	arrows: true,
	infinite: false,
	speed: 500,
	slidesToShow: 1,
	slidesToScroll: 1,
};

const SinglePropertyPage = () => {
	const { propertyId } = useParams(); // Removed `state` & `propertyNameSlug` since not used
	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// For the Google Map
	const [mapLoaded, setMapLoaded] = useState(false);

	useEffect(() => {
		const fetchPropertyDetails = async () => {
			setLoading(true);
			try {
				// Fetch property details from your backend
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/property-details/${propertyId}`
				);
				setProperty(res.data);
			} catch (err) {
				console.error("Error fetching property details:", err);
				setError("Failed to fetch property details.");
			} finally {
				setLoading(false);
			}
		};

		fetchPropertyDetails();
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

	// ---------------- DESTRUCTURE PROPERTY FIELDS ----------------
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
		propertyPhotos,
		roomCountDetails,
		location,
	} = property;

	// Safe checks for lat/lng
	const lat =
		location &&
		location.coordinates &&
		location.coordinates.length === 2 &&
		location.coordinates[1];
	const lng =
		location &&
		location.coordinates &&
		location.coordinates.length === 2 &&
		location.coordinates[0];

	// If propertySize is an object => { size, unit }
	const sizeValue = propertySize?.size || 0;
	const sizeUnit = propertySize?.unit || "square meter";

	// Format currency (e.g., "rupee" -> "Rupee")
	const displayCurrency = currency
		? currency[0].toUpperCase() + currency.slice(1).toLowerCase()
		: "";

	// Slick settings for the main carousel
	const mainSliderSettings = {
		dots: true,
		infinite: true,
		speed: 800,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: false,
		arrows: true,
		adaptiveHeight: true,
	};

	return (
		<PageWrapper>
			{/* ---------------- Carousel Section ---------------- */}
			<CarouselSection>
				<Slider {...mainSliderSettings}>
					{propertyPhotos && propertyPhotos.length > 0 ? (
						propertyPhotos.map((photo, idx) => (
							<div className='image-slide' key={idx}>
								<img
									src={photo.url}
									alt={`Slide ${idx + 1}`}
									// Avoid "image" / "photo" words for a11y
								/>
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

			{/* ---------------- Property Overview Section ---------------- */}
			<PropertyOverviewSection>
				<h1 className='property-title'>
					{propertyName}{" "}
					{propertyName_OtherLanguage && (
						<span className='secondary-title'>
							({propertyName_OtherLanguage})
						</span>
					)}
				</h1>
				<div className='meta'>
					<div>
						<label>Property Status:</label>{" "}
						<span className='highlight'>{propertyStatus || "N/A"}</span>
					</div>
					<div>
						<label>Type:</label>{" "}
						<span className='highlight'>{propertyType || "N/A"}</span>
					</div>
				</div>
				<div className='meta'>
					<div>
						<label>Floors:</label> {propertyFloors || "N/A"}
					</div>
					<div>
						<label>Bedrooms:</label> {overallRoomsCount || "N/A"}
					</div>
					<div>
						<label>Bathrooms:</label> {bathRoomsCount || "N/A"}
					</div>
					<div>
						<label>Size:</label>{" "}
						{sizeValue > 0
							? `${formatNumber(sizeValue)} ${sizeUnit}`
							: "Not specified"}
					</div>
				</div>

				<div className='price'>
					{propertyPrice ? (
						<>
							<span>{formatNumber(propertyPrice)}</span>
							{displayCurrency && (
								<span className='currency'> {displayCurrency}</span>
							)}
						</>
					) : (
						"Price Not Specified"
					)}
				</div>

				{propertyAddress && (
					<div className='address'>
						<label>Address:</label> {propertyAddress}
					</div>
				)}
				{phone && (
					<div className='contact'>
						<label>Contact Phone:</label> <span>{phone}</span>
					</div>
				)}
			</PropertyOverviewSection>

			{/* ---------------- About Property ---------------- */}
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
							<strong>Hindi:</strong> {aboutPropertyOtherLanguange}
						</p>
					)}
				</div>
			</SectionWrapper>

			{/* ---------------- Amenities & Views ---------------- */}
			<SectionWrapper>
				<SectionTitle>Amenities & Views</SectionTitle>
				<RowWrapper>
					<Column>
						<h4>Amenities</h4>
						{amenities && amenities.length > 0 ? (
							<ChipList>
								{amenities.map((amen, idx) => (
									<div className='chip' key={idx}>
										<InfoCircleOutlined /> <span>{amen}</span>
									</div>
								))}
							</ChipList>
						) : (
							<EmptyNote>No amenities specified.</EmptyNote>
						)}
					</Column>
					<Column>
						<h4>Views</h4>
						{views && views.length > 0 ? (
							<ChipList>
								{views.map((v, idx) => (
									<div className='chip' key={idx}>
										<InfoCircleOutlined /> <span>{v}</span>
									</div>
								))}
							</ChipList>
						) : (
							<EmptyNote>No views specified.</EmptyNote>
						)}
					</Column>
				</RowWrapper>
			</SectionWrapper>

			{/* ---------------- Rooms Section ---------------- */}
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
											style={{ fontStyle: "italic", color: "var(--darkGrey)" }}
										>
											(Hindi) {room.description_OtherLanguage}
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

			{/* ---------------- Close Areas ---------------- */}
			<SectionWrapper>
				<SectionTitle>Close Areas</SectionTitle>
				{closeAreas && closeAreas.length > 0 ? (
					<ul className='close-areas'>
						{closeAreas.map((area, idx) => (
							<li key={idx}>{area}</li>
						))}
					</ul>
				) : (
					<EmptyNote>No close areas specified.</EmptyNote>
				)}
			</SectionWrapper>

			{/* ---------------- Map Section ---------------- */}
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
									mapContainerStyle={{ width: "100%", height: "450px" }}
									center={{ lat: lat, lng: lng }}
									zoom={14}
								>
									<Marker position={{ lat: lat, lng: lng }} />
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
const PageWrapper = styled.div`
	width: 100%;
	margin: 0 auto;
	padding-bottom: 2rem;
	background: var(--mainWhite);
	color: var(--text-color-primary);

	@media (min-width: 1200px) {
		max-width: 1200px;
	}
`;

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

/* Carousel section */
const CarouselSection = styled.section`
	.image-slide {
		img {
			width: 100%;
			height: 60vh;
			object-fit: cover;
		}
	}
`;

const PropertyOverviewSection = styled.section`
	padding: 1.5rem;
	border-bottom: 1px solid var(--border-color-light);

	.property-title {
		font-size: 2rem;
		color: var(--primary-color-dark);
		margin-bottom: 0.5rem;
		.secondary-title {
			font-size: 1.2rem;
			color: var(--darkGrey);
		}
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 0.75rem;
		label {
			font-weight: 600;
			margin-right: 4px;
		}
		.highlight {
			color: var(--secondary-color);
			font-weight: bold;
		}
	}

	.price {
		font-size: 1.8rem;
		font-weight: bold;
		color: var(--secondary-color-dark);
		margin-bottom: 0.5rem;
		.currency {
			font-size: 1.3rem;
			margin-left: 4px;
		}
	}

	.address,
	.contact {
		margin-bottom: 0.3rem;
		label {
			font-weight: 600;
		}
		span {
			color: var(--primaryBlue);
		}
	}
`;

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
`;

/* Amenities & Views */
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
	}
`;

const ChipList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;

	.chip {
		display: inline-flex;
		align-items: center;
		background-color: var(--neutral-light);
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

const MapContainer = styled.div`
	width: 100%;
	height: 450px; /* The map needs an explicit height */
	margin-top: 1rem;
`;
