/** @format */
import React, { useMemo, useRef } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ---------- Helpers for agent deduplication ---------- */
function normalizeEmail(rawEmail) {
	return (rawEmail || "").trim().toLowerCase();
}
function normalizePhone(rawPhone) {
	return (rawPhone || "").replace(/[^\d]/g, "");
}
function normalizeName(rawName) {
	return (rawName || "").trim().toLowerCase();
}
function buildAgentSignature(agent = {}) {
	const name = normalizeName(agent.name);
	const email = normalizeEmail(agent.email);
	const phone = normalizePhone(agent.phone);
	return `${name}||${email}||${phone}`;
}

/* ---------- Slugify ---------- */
const slugify = (str = "") =>
	str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "");

const FeaturedAgents = ({ featuredProperties = [] }) => {
	/* 
    1) Hooks must be placed BEFORE any early return 
       or conditional code to avoid the "Hook called conditionally" error.
  */

	// Create a ref for tracking dragging state (if needed):
	const draggingRef = useRef({});

	// Deduplicate Agents using a memo
	const distinctAgents = useMemo(() => {
		const propArr = Array.isArray(featuredProperties) ? featuredProperties : [];
		const signatures = new Set();
		const result = [];

		for (const property of propArr) {
			if (!property?.belongsTo) continue;
			const agent = property.belongsTo;

			const sig = buildAgentSignature(agent);
			if (!signatures.has(sig)) {
				signatures.add(sig);
				result.push(agent);
			}
		}
		return result;
	}, [featuredProperties]);

	// If no agents to show, return null AFTER the hooks
	if (!distinctAgents.length) {
		return null;
	}

	// Slider settings
	const mainSliderSettings = {
		dots: false,
		infinite: false, // or distinctAgents.length > 4 if you want infinite loop for 5+ agents
		autoplay: true,
		autoplaySpeed: 4000,
		speed: 700,
		slidesToShow: 4,
		slidesToScroll: 1,
		pauseOnHover: true,
		pauseOnFocus: true,
		responsive: [
			{
				breakpoint: 1200,
				settings: { slidesToShow: 3 },
			},
			{
				breakpoint: 768,
				settings: {
					slidesToShow: 1.5,
					slidesToScroll: 1,
					centerMode: false,
				},
			},
		],
	};

	// Click handler
	const handleAgentClick = (agentSig, agent) => {
		if (draggingRef.current[agentSig]) return; // skip if dragging
		if (!agent._id) return;

		const agentNameSlug = slugify(agent.name || "agent");
		window.location.href = `/properties/${agent._id}/${agentNameSlug}`;
	};

	return (
		<FeaturedAgentsWrapper>
			<div className='featured-title'>
				<h2>Our Agents</h2>
			</div>

			<div className='slider-container'>
				<Slider {...mainSliderSettings}>
					{distinctAgents.map((agent) => {
						// If you aren’t using `_id` in the code,
						// omit it from destructuring to avoid ESLint no-unused-vars:
						const { name, email, phone, profilePhoto } = agent;
						const agentSig = buildAgentSignature(agent);

						const imageUrl =
							profilePhoto?.url ||
							"https://via.placeholder.com/600x400?text=No+Agent+Photo";

						return (
							<div key={agentSig} className='slide-padding'>
								<div className='property-card'>
									<div className='mini-carousel'>
										<div
											className='sub-slide'
											onClick={() => handleAgentClick(agentSig, agent)}
										>
											<img src={imageUrl} alt={name || "Agent"} />
										</div>
									</div>

									<div
										className='property-content'
										onClick={() => handleAgentClick(agentSig, agent)}
									>
										<h3>{name || "Unnamed Agent"}</h3>
										{email && <p className='agent-email'>Email: {email}</p>}
										{phone && <p className='property-type'>Phone: {phone}</p>}
									</div>
								</div>
							</div>
						);
					})}
				</Slider>
			</div>
		</FeaturedAgentsWrapper>
	);
};

export default FeaturedAgents;

/* -------------- STYLED COMPONENTS -------------- */
const FeaturedAgentsWrapper = styled.section`
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

	.slider-container {
		width: 90%;
		max-width: 1300px;
		margin: 0 auto;
	}

	.slide-padding {
		padding: 0 5px;
	}

	.slick-list {
		margin: 0 -5px;
	}

	.slider-container .slick-track {
		display: flex !important;
		align-items: stretch !important;
	}
	.slider-container .slick-slide {
		display: flex !important;
		align-items: stretch !important;
		height: auto !important;
	}
	.slider-container .slick-slide > div {
		display: flex;
		width: 100%;
	}

	.property-card {
		background: var(--neutral-light);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--box-shadow-light);
		transition: var(--main-transition);
		min-height: 450px;
		display: flex;
		flex-direction: column;

		&:hover {
			box-shadow: var(--box-shadow-dark);
		}

		.mini-carousel {
			position: relative;
			width: 100%;
			height: 300px;
			overflow: hidden;

			.sub-slide {
				cursor: pointer;
				img {
					width: 100%;
					object-fit: cover;
					display: block;
				}
			}
			.slick-dots {
				display: none !important;
			}
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
				text-transform: capitalize;
			}

			/* smaller email text */
			.agent-email {
				color: var(--primary-color);
				margin-bottom: 0.25rem;
				font-size: 0.9rem; /* slightly smaller */
			}

			.property-type {
				color: var(--secondary-color);
				margin-bottom: 0.5rem;
				text-transform: capitalize;
			}
		}
	}

	.slick-prev:before,
	.slick-next:before {
		color: var(--primary-color);
		font-size: 1.5rem;
	}

	.slick-slide {
		outline: none;
	}

	@media (max-width: 600px) {
		.property-content {
			h3 {
				font-size: 0.95rem !important;
				font-weight: bold;
			}
		}
	}
`;
