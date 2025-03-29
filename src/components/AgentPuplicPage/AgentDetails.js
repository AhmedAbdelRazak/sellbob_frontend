/** @format */
// src/components/AgentPuplicPage/AgentDetails.jsx

import React from "react";
import styled from "styled-components";

/**
 * AgentDetails: Displays a single agent's profile photo and info
 * in a nice, responsive layout using Bootstrap row/col classes,
 * plus a diagonal watermark "SELLBOB" that's fully contained.
 */
const AgentDetails = ({ agent }) => {
	if (!agent) return null;

	const { name, email, phone, profilePhoto } = agent;
	const photoUrl =
		profilePhoto?.url ||
		"https://via.placeholder.com/200x200?text=No+Agent+Photo";

	return (
		/**
		 * We add "my-4 py-5" to the Bootstrap classes to give extra
		 * vertical spacing. This helps ensure the watermark is fully visible.
		 */
		<AgentDetailsWrapper className='container my-4 py-5'>
			<div className='row align-items-center agent-details-row'>
				{/* Left side: Photo */}
				<div className='col-12 col-md-4 agent-photo-col'>
					<div className='photo-wrapper'>
						<img src={photoUrl} alt={name || "Agent"} />
					</div>
				</div>

				{/* Right side: Agent info */}
				<div className='col-12 col-md-8 agent-info-col'>
					<h2>
						Agent Name: <strong>{name || "Unnamed Agent"}</strong>
					</h2>

					{email && (
						<p>
							<strong>Email:</strong>{" "}
							<a href={`mailto:${email}`} className='info-link'>
								{email}
							</a>
						</p>
					)}

					{phone && (
						<p>
							<strong>Phone:</strong>{" "}
							<a href={`tel:${phone}`} className='info-link'>
								{phone}
							</a>
						</p>
					)}
				</div>
			</div>
		</AgentDetailsWrapper>
	);
};

export default AgentDetails;

/* ------------------ STYLED COMPONENT ------------------ */
const AgentDetailsWrapper = styled.div`
	position: relative;
	background: #fff;
	width: 100%;

	/* Watermark behind content */
	&::before {
		content: "SELLBOB";
		position: absolute;
		/* Shift it up a bit so the bottom doesn't go off-screen */
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-30deg);
		/* Adjust clamp so it still looks big but stays inside the container */
		font-size: clamp(3.5rem, 10vw, 8rem);
		color: var(--primary-color);
		opacity: 0.05;
		z-index: 0;
		pointer-events: none;
		white-space: nowrap;
		font-weight: 700;
	}

	.agent-details-row {
		position: relative;
		z-index: 1; /* Content above watermark */
		row-gap: 1.5rem;
	}

	.agent-photo-col {
		.photo-wrapper {
			width: 100%;
			max-width: 250px;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: var(--box-shadow-light);

			img {
				width: 100%;
				height: auto;
				border-radius: 8px;
				object-fit: cover;
			}
		}
	}

	.agent-info-col {
		display: flex;
		flex-direction: column;

		h2 {
			margin-bottom: 0.8rem;
			font-size: 1.7rem;
			color: var(--primary-color);
			line-height: 1.2;
		}

		p {
			margin: 0.4rem 0;
			font-size: 1rem;
			color: var(--text-color-primary);

			strong {
				margin-right: 4px;
			}

			.info-link {
				color: var(--primary-color);
				text-decoration: underline;
				transition: var(--main-transition);

				&:hover {
					color: var(--secondary-color);
				}
			}
		}
	}

	@media (max-width: 576px) {
		.agent-photo-col .photo-wrapper {
			max-width: 180px;
		}
	}
`;
