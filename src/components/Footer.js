import React from "react";
import styled from "styled-components";
// Example icons from react-icons (you have "react-icons" in package.json)
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<FooterWrapper>
			<div className='footer-container'>
				<div className='social-icons'>
					<a
						href='https://www.facebook.com/'
						target='_blank'
						rel='noreferrer'
						aria-label='Facebook'
					>
						<FaFacebookF />
					</a>
					<a
						href='https://twitter.com/'
						target='_blank'
						rel='noreferrer'
						aria-label='Twitter'
					>
						<FaTwitter />
					</a>
					<a
						href='https://instagram.com/'
						target='_blank'
						rel='noreferrer'
						aria-label='Instagram'
					>
						<FaInstagram />
					</a>
				</div>

				<div className='links'>
					{/* Example internal links */}
					<Link to='/about'>About Us</Link>
					<Link to='/contact'>Contact</Link>
					<Link to='/properties'>Our Properties</Link>
				</div>

				<p className='copyright'>
					&copy; {new Date().getFullYear()} SellBob. All rights reserved.
				</p>
			</div>
		</FooterWrapper>
	);
};

export default Footer;

const FooterWrapper = styled.footer`
	background: var(--primary-color-dark);
	color: var(--text-color-light);
	padding: 2rem 0;

	.footer-container {
		width: 90%;
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.social-icons {
		margin-bottom: 1rem;

		a {
			color: var(--text-color-light);
			font-size: 1.25rem;
			margin: 0 0.5rem;
			transition: var(--main-transition);

			&:hover {
				color: var(--secondary-color);
			}
		}
	}

	.links {
		margin-bottom: 1rem;

		a {
			color: var(--text-color-light);
			text-decoration: none;
			margin: 0 0.75rem;
			transition: var(--main-transition);

			&:hover {
				color: var(--secondary-color);
			}
		}
	}

	p {
		margin: 0;
		font-size: 0.9rem;
	}
`;
