import React from "react";
import styled from "styled-components";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper to make a slug from the property name
const slugify = (str = "") => {
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // replace spaces with -
		.replace(/[^\w-]+/g, ""); // remove all non-word chars (optional)
};

// Helper to format price with comma separators
const formatPrice = (price) => {
	if (!price && price !== 0) return "N/A";
	return price.toLocaleString("en-US"); // e.g. 145,000,000
};

// Helper to capitalize currency (e.g., "rupee" -> "Rupee")
const formatCurrency = (currency = "") => {
	if (!currency) return "";
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

	// Combine and map them to just the URL (some might contain { public_id, url })
	const allPhotos = [...photosFromProperty, ...photosFromRooms];
	return allPhotos.map((p) => p.url);
};

const Featured = ({ featuredProperties = [] }) => {
	// If there are no featuredProperties, show nothing
	if (featuredProperties.length === 0) {
		return null;
	}

	// Only autoplay/infinite if we have >= 4 featured properties
	const canAutoplay = featuredProperties.length >= 4;

	// Top-level slider settings for Featured Properties
	const mainSliderSettings = {
		dots: false,
		infinite: canAutoplay,
		autoplay: canAutoplay,
		autoplaySpeed: 4000,
		speed: 700,
		slidesToShow: 4, // On large screens
		slidesToScroll: 1,
		responsive: [
			{
				// Tablet screens (< 1200px)
				breakpoint: 1200,
				settings: {
					slidesToShow: 3,
					infinite: featuredProperties.length > 3,
					autoplay: featuredProperties.length > 3,
				},
			},
			{
				// Phone screens (< 768px)
				// Show 1.5 slides so we see half of the next property on the right
				breakpoint: 768,
				settings: {
					slidesToShow: 1.5,
					slidesToScroll: 1,
					infinite: featuredProperties.length > 1,
					autoplay: featuredProperties.length > 1,
					centerMode: false,
				},
			},
		],
	};

	// Sub‐slider settings (NO dots/arrows for the images in each card)
	const subSliderSettings = {
		dots: false,
		arrows: false,
		infinite: false,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
	};

	// When user clicks on property content, navigate:
	const handleGoToProperty = (property) => {
		const { propertyState, _id, propertyName } = property;
		const slug = slugify(propertyName);
		window.location.href = `/single-property/${propertyState}/${slug}/${_id}`;
	};

	return (
		<FeaturedWrapper>
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
						} = property;

						// Combine all images in a single array
						const allImages = getAllPropertyImages(property);

						// Format price & currency on same line
						const displayPrice = formatPrice(propertyPrice);
						const displayCurrency = formatCurrency(currency);

						// Build address (if you want them in one line)
						const addressParts = [
							propertyAddress,
							propertyCity,
							propertyState,
							propertyCountry,
						]
							.filter(Boolean)
							.join(", ");

						// If propertySize is available, e.g. propertySize = { size: 100, unit: 'meter' }
						const sizeAvailable =
							propertySize && propertySize.size > 0 && propertySize.unit;

						return (
							<div key={_id} className='slide-padding'>
								<div className='property-card'>
									{/* Sub Carousel for images */}
									<div className='mini-carousel'>
										<Slider {...subSliderSettings}>
											{allImages.length > 0 ? (
												allImages.map((imageUrl, idx) => (
													<div
														key={idx}
														className='sub-slide'
														onClick={() => handleGoToProperty(property)}
													>
														<img src={imageUrl} alt={`Property ${idx}`} />
													</div>
												))
											) : (
												<div
													className='sub-slide'
													onClick={() => handleGoToProperty(property)}
												>
													<img
														src='https://via.placeholder.com/600x400?text=No+Image'
														alt='No Property Photos'
													/>
												</div>
											)}
										</Slider>
									</div>

									{/* Property Content & Click */}
									<div
										className='property-content'
										onClick={() => handleGoToProperty(property)}
									>
										<h3>{propertyName || "N/A"}</h3>

										{/* Price + Currency on the same line */}
										<p className='property-price'>
											Price: {displayPrice} {displayCurrency}
										</p>

										<p className='property-type'>
											Type: {propertyType || "N/A"}
										</p>

										{/* Address (all parts in one line if exist) */}
										{addressParts && (
											<p className='property-address'>
												Address: {addressParts}
											</p>
										)}

										{/* Property size */}
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

/* ------------------ STYLED COMPONENTS ------------------ */
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
			/* Capitalize the heading if you like: text-transform: capitalize; */
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

	/* Remove the default side padding in slick-list to fit .slide-padding usage */
	.slick-list {
		margin: 0 -5px;
	}

	/* ============== Property Card ============== */
	.property-card {
		background: var(--neutral-light);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--box-shadow-light);
		transition: var(--main-transition);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: stretch;

		/* Capitalize all texts inside the card */
		text-transform: capitalize;

		&:hover {
			box-shadow: var(--box-shadow-dark);
		}

		.mini-carousel {
			width: 100%;
			height: 220px; /* Adjust as you like */
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

			/* Hide the slick dots for the sub‐carousel if they appear */
			.slick-dots {
				display: none !important;
			}

			/* Hide the arrows for the sub‐carousel if they appear */
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
				/* text-transform is inherited from .property-card if you prefer */
			}

			.property-price {
				color: var(--primary-color);
				margin-bottom: 0.25rem;
			}

			.property-type {
				color: var(--secondary-color);
				margin-bottom: 0.5rem;
			}

			.property-address,
			.property-size {
				color: var(--text-color-dark);
				font-size: 0.95rem;
				margin-bottom: 0.25rem;
			}
		}
	}

	/* Arrows for the main slider */
	.slick-prev:before,
	.slick-next:before {
		color: var(--primary-color);
		font-size: 1.5rem;
	}

	/* Remove focus outline on slides */
	.slick-slide {
		outline: none;
	}
`;
