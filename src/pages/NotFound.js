import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
	return (
		<NotFoundWrapper>
			<div className='content'>
				<FaExclamationTriangle className='icon' />
				<h1>404 - Page Not Found</h1>
				<p>
					Oops! The page you are looking for doesn&apos;t exist or has been
					moved.
				</p>
				<Link to='/' className='back-home'>
					Go Back Home
				</Link>
			</div>
		</NotFoundWrapper>
	);
};

export default NotFound;

const NotFoundWrapper = styled.section`
	min-height: 70vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--neutral-light);

	.content {
		text-align: center;
		background: var(--mainWhite);
		padding: 2rem 3rem;
		border-radius: 10px;
		box-shadow: var(--box-shadow-light);

		.icon {
			font-size: 4rem;
			color: var(--secondary-color);
			margin-bottom: 1rem;
		}

		h1 {
			font-size: 2rem;
			color: var(--primary-color-dark);
			margin-bottom: 1rem;
		}

		p {
			color: var(--text-color-secondary);
			margin-bottom: 1.5rem;
		}

		.back-home {
			background: var(--button-bg-primary);
			color: var(--button-font-color);
			padding: 0.75rem 1.5rem;
			border-radius: 5px;
			text-decoration: none;
			font-weight: 600;
			transition: var(--main-transition);

			&:hover {
				background: var(--button-bg-primary-light);
			}
		}
	}
`;
