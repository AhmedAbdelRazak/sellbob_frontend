import React from "react";
import styled from "styled-components";
import { useCartContext } from "../cart_context";

const Aboutus = () => {
	const { websiteSetup } = useCartContext();

	return (
		<AboutusWrapper>
			{websiteSetup &&
				websiteSetup.aboutUsBanner &&
				websiteSetup.aboutUsBanner.url && (
					<BannerWrapper>
						<img src={websiteSetup.aboutUsBanner.url} alt='About Us Banner' />
					</BannerWrapper>
				)}
			<br />
			{websiteSetup &&
			websiteSetup.aboutUsBanner &&
			websiteSetup.aboutUsBanner.paragraph ? (
				<DescriptionWrapper className='my-5'>
					<div
						dangerouslySetInnerHTML={{
							__html: websiteSetup.aboutUsBanner.paragraph,
						}}
					/>
				</DescriptionWrapper>
			) : null}
		</AboutusWrapper>
	);
};

export default Aboutus;

const AboutusWrapper = styled.div`
	min-height: 750px;
	padding: 10px 200px;
	background-color: #f9f9f9;

	p {
		padding: 0px !important;
		margin: 5px 0px !important;
	}

	div {
		padding: 0px !important;
		margin: 5px 0px !important;
	}

	@media (max-width: 800px) {
		padding: 30px;
	}

	ul,
	ol {
		margin-left: 1.5em;
		padding-left: 1.5em;

		margin-top: 0px !important;
		padding-top: 0px !important;
		margin-bottom: 0px !important;
		padding-bottom: 0px !important;
	}

	h2 {
		font-weight: bold;
	}

	@media (max-width: 800px) {
		h1 > strong {
			font-size: 1.8rem !important;
		}

		h2 {
			font-size: 1.3rem;
			font-weight: bold;
		}

		ul,
		ol {
			margin-left: 1em;
			padding-left: 1em;
		}
	}
`;

const BannerWrapper = styled.div`
	margin-bottom: 30px;

	img {
		width: 100%;
		height: auto;
		border-radius: 5px;
		max-height: 600px;
		object-fit: cover;
	}
`;

const DescriptionWrapper = styled.div`
	font-size: 1rem;
	color: #333;
	line-height: 1.3;

	img {
		width: 100%;
		height: auto;
		border-radius: 5px;
		max-height: 600px;
		object-fit: cover;
		padding: 0px !important;
		margin: 0px !important;
	}
`;
