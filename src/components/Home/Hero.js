import React from "react";
import Slider from "react-slick";
import styled from "styled-components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Hero = ({ websiteSetup }) => {
	// Banners array from your global setup
	const banners = websiteSetup?.homeMainBanners || [];

	// React Slick settings
	const settings = {
		dots: true, // show pagination dots
		infinite: true, // loop
		speed: 1000, // slide transition speed (ms)
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true, // auto-play slides
		autoplaySpeed: 4000, // each slide visible for 4s
		arrows: true, // show next/prev arrows
	};

	return (
		<HeroSection>
			<SliderContainer>
				<Slider {...settings}>
					{banners.map((banner, idx) => {
						const {
							url,
							title,
							subTitle,
							buttonTitle,
							btnBackgroundColor,
							pageRedirectURL,
						} = banner;

						return (
							<Slide key={idx}>
								{/* If there's an image URL, show it; otherwise you could show a fallback */}
								{url ? (
									<BannerImage src={url} alt={`Banner ${idx + 1}`} />
								) : (
									<Placeholder>Banner {idx + 1}</Placeholder>
								)}

								{/* Content over the banner */}
								<BannerContent>
									{title && <h2>{title}</h2>}
									{subTitle && <p>{subTitle}</p>}

									{buttonTitle && (
										<a
											href={pageRedirectURL || "#"}
											style={{ backgroundColor: btnBackgroundColor || "#000" }}
											className='banner-btn'
										>
											{buttonTitle}
										</a>
									)}
								</BannerContent>
							</Slide>
						);
					})}
				</Slider>
			</SliderContainer>
		</HeroSection>
	);
};

export default Hero;

const HeroSection = styled.section`
	width: 67%;
	margin: 0 auto;

	@media (max-width: 768px) {
		width: 100%;
		height: auto;
		/* Force a 1:1 aspect ratio on small screens if you want the slide to be a square. 
       Alternatively, if you want it *truly* full screen on mobile, you could do height: 100vh. */
		aspect-ratio: 1/1;
	}
`;

const SliderContainer = styled.div`
	width: 100%;
	height: 100%;

	/* Some slick classes for customizing dots/arrows */
	.slick-slider {
		width: 100%;
		height: 100%;
	}

	.slick-dots {
		bottom: 10px;
	}

	.slick-prev,
	.slick-next {
		z-index: 2; /* ensure arrows overlay the images */
		background: var(--primaryBlueDarker);
		padding: 1px;
		border-radius: 3px;
	}
`;

/**
 * Individual Slide
 * - Fill the parent’s height
 * - Position relative so we can absolutely position content
 */
const Slide = styled.div`
	position: relative;
	width: 100%;
	height: 100%;

	@media (max-width: 768px) {
		aspect-ratio: 1/1;
	}
`;

/** The actual banner image */
const BannerImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover; /* keep the image cropped nicely */
`;

/** If no URL is provided, just show a gray placeholder */
const Placeholder = styled.div`
	background-color: #ccc;
	width: 100%;
	height: 100%;
`;

const BannerContent = styled.div`
	position: absolute;
	top: 50%;
	left: 10%;
	transform: translateY(-50%);
	color: #fff;
	max-width: 40%;
	/* Adjust as needed for text layout */

	h2 {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.2rem;
		line-height: 1.4;
		margin-bottom: 1rem;
	}

	.banner-btn {
		display: inline-block;
		color: #fff;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border-radius: 5px;
		font-weight: bold;
		transition: all 0.3s ease;
		&:hover {
			opacity: 0.8;
		}
	}

	@media (max-width: 992px) {
		max-width: 60%;
		h2 {
			font-size: 2rem;
		}
		p {
			font-size: 1rem;
		}
	}

	@media (max-width: 768px) {
		top: 45%;
		left: 5%;
		max-width: 90%;
		h2 {
			font-size: 1.5rem;
		}
		p {
			font-size: 0.9rem;
		}
	}
`;
