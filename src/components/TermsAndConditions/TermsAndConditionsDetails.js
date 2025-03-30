import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Tabs } from "antd";
import { useLocation, useHistory } from "react-router-dom";

const TermsAndConditionsDetails = ({ websiteSetup }) => {
	const location = useLocation();
	const history = useHistory();

	// Identifiers for each tab
	const TAB_KEYS = {
		TERMS_CLIENTS: "termsandconditions", // websiteSetup.termsAndCondition
		TERMS_B2B: "termsandconditionsb2b", // websiteSetup.termsAndCondition_B2B
		PRIVACY: "privacy", // websiteSetup.privacyPolicy
	};

	// Grab ?tab= from the URL
	const searchParams = new URLSearchParams(location.search);
	let initialTab = searchParams.get("tab");

	// Validate the query param; default to "termsandconditions" if missing/invalid
	const validTabs = [
		TAB_KEYS.TERMS_CLIENTS,
		TAB_KEYS.TERMS_B2B,
		TAB_KEYS.PRIVACY,
	];
	if (!validTabs.includes(initialTab)) {
		initialTab = TAB_KEYS.TERMS_CLIENTS;
	}

	const [activeTab, setActiveTab] = useState(initialTab);

	// Determine tab position based on screen width
	const getTabPosition = () => (window.innerWidth < 992 ? "top" : "left");
	const [tabPosition, setTabPosition] = useState(getTabPosition());

	useEffect(() => {
		const handleResize = () => {
			setTabPosition(getTabPosition());
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Sync tab changes with the URL query param
	const onTabChange = (key) => {
		setActiveTab(key);
	};

	useEffect(() => {
		const sp = new URLSearchParams(location.search);
		sp.set("tab", activeTab);
		history.replace({ search: sp.toString() }); // replace() avoids extra history entries
		// eslint-disable-next-line
	}, [activeTab]);

	// HTML content for each tab
	const tabContent = {
		[TAB_KEYS.TERMS_CLIENTS]: websiteSetup?.termsAndCondition || "",
		[TAB_KEYS.TERMS_B2B]: websiteSetup?.termsAndCondition_B2B || "",
		[TAB_KEYS.PRIVACY]: websiteSetup?.privacyPolicy || "",
	};

	// Define our three tabs
	const items = [
		{
			label: "Terms & Conditions (Clients)",
			key: TAB_KEYS.TERMS_CLIENTS,
		},
		{
			label: "Terms & Conditions B2B (For Agents & Owners)",
			key: TAB_KEYS.TERMS_B2B,
		},
		{
			label: "Privacy Policy",
			key: TAB_KEYS.PRIVACY,
		},
	];

	return (
		<TermsAndConditionsDetailsWrapper className='mx-auto'>
			<div className='row'>
				<div className='col-md-3 my-2'>
					<div className='tabs-wrapper'>
						<Tabs
							tabPosition={tabPosition}
							activeKey={activeTab}
							onChange={onTabChange}
							items={items}
						/>
					</div>
				</div>

				<div className='col-md-9 my-2'>
					{/* Main content area */}
					<div className='tab-content'>
						<div
							className='inner-html'
							dangerouslySetInnerHTML={{ __html: tabContent[activeTab] }}
						/>
					</div>
				</div>
			</div>
			{/* Left or top tabs */}
		</TermsAndConditionsDetailsWrapper>
	);
};

export default TermsAndConditionsDetails;

/* --------------------------------------------
   STYLES
--------------------------------------------- */
const TermsAndConditionsDetailsWrapper = styled.div`
	margin-top: 2rem;
	max-width: 1600px;
	margin-bottom: 50px;

	/* Basic styling for HTML from Quill */
	.inner-html {
		padding: 0.5rem 1rem;

		img {
			max-width: 100%;
			height: auto;
			display: block;
			margin: 1rem auto;
		}

		ul,
		ol {
			padding-left: 1.5rem;
			margin-bottom: 1rem;
		}

		li {
			margin-bottom: 0.5rem;
		}

		h1,
		h2,
		h3,
		h4,
		h5 {
			margin-top: 1rem;
			margin-bottom: 0.75rem;
			color: var(--primary-color-dark);
		}

		p {
			margin-bottom: 1rem;
		}
	}

	/* ---------------------------------------
     MEDIA QUERY for smaller devices:
     Switch to horizontal (top) tabs 
     and remove the vertical line
  ---------------------------------------- */
	@media screen and (max-width: 992px) {
		.content-wrapper {
			flex-direction: column;
		}

		.tabs-wrapper {
			flex: 0 0 auto;
			max-width: 100%;
		}

		.vertical-line {
			display: none;
		}

		.tab-content {
			flex: 0 0 auto;
			max-width: 100%;
			margin-top: 1rem;
		}
	}
`;
