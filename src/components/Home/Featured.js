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

	// Sub‐slider settings for images in each card
	const subSliderSettings = {
		dots: true,
		arrows: true,
		infinite: false,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
	};

	// Gather all images from propertyPhotos & roomCountDetails
	const getAllPropertyImages = (property) => {
		const photos1 = property?.propertyPhotos || [];
		// Flatten out the roomCountDetails photos
		let photos2 = [];
		if (property?.roomCountDetails?.length > 0) {
			photos2 = property.roomCountDetails
				.map((room) => room.photos || [])
				.flat();
		}
		// Combine them
		return [...photos1, ...photos2].map((p) => p.url);
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
						const { _id, propertyName, propertyPrice, propertyType } = property;

						// Combine all images in a single array
						const allImages = getAllPropertyImages(property);

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
														<img src={imageUrl} alt={`Slide ${idx}`} />
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
										<h3>{propertyName}</h3>
										<p className='property-price'>
											Price: {propertyPrice || "N/A"}
										</p>
										<p className='property-type'>
											Type: {propertyType || "N/A"}
										</p>
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
	/* Light silver/gray background for a metallic-like feel */
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

	/* Container for the main slider */
	.slider-container {
		width: 90%;
		max-width: 1300px;
		margin: 0 auto;
	}

	/* Gap between slides */
	.slide-padding {
		padding: 0 5px;
	}
	.slick-list {
		margin: 0 -5px;
	}

	/* Property Card styling */
	.property-card {
		background: var(--neutral-light);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--box-shadow-light);
		transition: var(--main-transition);

		&:hover {
			box-shadow: var(--box-shadow-dark);
		}

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: stretch;

		.mini-carousel {
			width: 100%;
			height: 220px; /* Adjust as you like */
			overflow: hidden;

			.sub-slide {
				img {
					width: 100%;
					height: 220px;
					object-fit: cover;
					display: block;
				}
			}
			.slick-dots {
				bottom: 5px; /* Move the dots slightly up */
			}
		}

		/* The clickable portion for property details */
		.property-content {
			padding: 1rem;
			cursor: pointer; /* user sees this as clickable */

			h3 {
				color: var(--text-color-dark);
				margin-bottom: 0.5rem;
				font-size: 1.2rem;
			}
			.property-price {
				color: var(--primary-color);
				margin-bottom: 0.25rem;
			}
			.property-type {
				color: var(--secondary-color);
				margin-bottom: 0.5rem;
			}
		}
	}

	/* Arrows for the main slider */
	.slick-prev:before,
	.slick-next:before {
		color: var(--primary-color);
		font-size: 1.5rem;
	}

	/* Arrows for the sub‐slider (the mini-carousel) */
	.mini-carousel .slick-prev:before,
	.mini-carousel .slick-next:before {
		color: #555; /* a bit more subtle, but adjust as desired */
	}

	/* Remove focus outline on slides */
	.slick-slide {
		outline: none;
	}
`;
