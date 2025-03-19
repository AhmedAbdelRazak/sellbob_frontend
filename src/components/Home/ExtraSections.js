import React from "react";
import styled from "styled-components";

const ExtraSections = ({ websiteSetup }) => {
	// Safely check if homePageSections exists and has length
	if (
		!websiteSetup?.homePageSections ||
		websiteSetup.homePageSections.length === 0
	) {
		return null; // No sections to show, return nothing
	}

	return (
		<ExtraSectionsWrapper>
			{websiteSetup.homePageSections.map((section, index) => {
				// destructure fields you need
				const {
					url,
					title = "",
					subTitle = "",
					textOnImage = "",
					buttonTitle = "",
					link, // or whatever your link field is in your data
				} = section;

				// fallback link if none is provided
				const finalLink = link && link.trim() !== "" ? link : "/properties";

				return (
					<BannerContainer key={index}>
						<div
							className='banner-image'
							style={{ backgroundImage: `url(${url})` }}
						>
							<div className='banner-overlay'>
								{/* Title */}
								{title && <h2>{title}</h2>}

								{/* SubTitle or textOnImage (choose which you prefer) */}
								{(subTitle || textOnImage) && <p>{subTitle || textOnImage}</p>}

								{/* If you have a button label, display the button */}
								{buttonTitle && (
									<a href={finalLink} className='banner-button'>
										{buttonTitle}
									</a>
								)}
							</div>
						</div>
					</BannerContainer>
				);
			})}
		</ExtraSectionsWrapper>
	);
};

export default ExtraSections;

/* ------------------ STYLED COMPONENTS ------------------ */

const ExtraSectionsWrapper = styled.section`
	margin: 2rem 0;
`;

const BannerContainer = styled.div`
	/* By default, let's use 70% width and center it. */
	width: 70%;
	margin: 0 auto 3rem;

	/* For smaller screens, take 100% width */
	@media (max-width: 768px) {
		width: 100%;
	}

	.banner-image {
		position: relative;
		width: 100%;
		/* Adjust height to taste (could also be auto with padding) */
		height: 400px;
		background-size: cover;
		background-position: center center;
		background-repeat: no-repeat;
		border-radius: 8px;

		/* If you want a subtle dark overlay, you can do it here or
       inside the .banner-overlay with a background color. */
	}

	.banner-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		/* Slight dark overlay on the banner background */
		background-color: rgba(0, 0, 0, 0.4);

		/* Center your text overlay content both horizontally & vertically */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		text-align: center;
		color: #fff;
		padding: 1rem;
	}

	h2 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	p {
		font-size: 1rem;
		margin-bottom: 1.5rem;
		max-width: 80%;
	}

	.banner-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #ff5a5f;
		color: #fff;
		text-decoration: none;
		font-weight: 600;
		border-radius: 4px;
	}
`;
