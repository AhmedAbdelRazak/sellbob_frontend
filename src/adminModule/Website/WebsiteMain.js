import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import { Tabs, Button, message } from "antd";
import { getWebsiteSetup, updateWebsiteSetup } from "../apiAdmin";

// Child components
import HomeSection from "./HomeSection";
import HomeExtraSections from "./HomeExtraSections";
import ContactUsSection from "./ContactUsSection";
import AboutUsSection from "./AboutUsSection";
import TermsGuestsSection from "./TermsGuestsSection";
import TermsB2BSection from "./TermsB2BSection";
import PrivacyPolicySection from "./PrivacyPolicySection";
import { isAuthenticated } from "../../auth";

const { TabPane } = Tabs;

const WebsiteMain = () => {
	const [collapsed, setCollapsed] = useState(false);
	const [AdminMenuStatus, setAdminMenuStatus] = useState(false);

	const [websiteData, setWebsiteData] = useState({
		sellbobLogo: {},
		homeMainBanners: [],
		homePageSections: [],
		contactUsPage: {},
		aboutUsBanner: {},
		termsAndCondition: "",
		termsAndCondition_B2B: "",
		privacyPolicy: "",
	});

	// We'll default to "home" if no stored tab
	const storedTab = localStorage.getItem("websiteActiveTab") || "home";
	const [activeTab, setActiveTab] = useState(storedTab);

	const [loading, setLoading] = useState(false);

	const { user, token } = isAuthenticated();

	// Example admin credentials
	const userId = user._id;

	useEffect(() => {
		// Collapse for mobile
		if (window.innerWidth <= 1000) {
			setCollapsed(true);
		}

		// Attempt to fetch the doc from the backend
		fetchWebsiteData();
		// eslint-disable-next-line
	}, []);

	// Fetch single website doc
	const fetchWebsiteData = () => {
		setLoading(true);
		getWebsiteSetup(userId, token)
			.then((res) => {
				setLoading(false);
				if (res && !res.error) {
					setWebsiteData(res);
				} else if (res && res.error) {
					message.error(res.error);
				}
			})
			.catch((err) => {
				setLoading(false);
				console.error("Error fetching website setup:", err);
				message.error("Failed to load website data");
			});
	};

	// Switch tabs & store in localStorage
	const handleTabChange = (key) => {
		setActiveTab(key);
		localStorage.setItem("websiteActiveTab", key);
	};

	// Save changes to backend, then refetch to sync
	const handleSaveChanges = () => {
		setLoading(true);
		updateWebsiteSetup(userId, token, websiteData)
			.then((res) => {
				setLoading(false);
				if (res && !res.error) {
					message.success("Website setup updated successfully!");
					// Now refetch to ensure local data is the updated doc
					fetchWebsiteData();
				} else if (res && res.error) {
					message.error(res.error);
				}
			})
			.catch((err) => {
				setLoading(false);
				console.error("Error updating website setup:", err);
				message.error("Update failed");
			});
	};

	return (
		<WebsiteMainWrapper show={collapsed}>
			<div className='grid-container-main'>
				<div className='navcontent'>
					<AdminNavbar
						fromPage='Website'
						AdminMenuStatus={AdminMenuStatus}
						setAdminMenuStatus={setAdminMenuStatus}
						collapsed={collapsed}
						setCollapsed={setCollapsed}
					/>
				</div>

				<div className='otherContentWrapper'>
					<div className='container-wrapper'>
						<h2 style={{ marginBottom: "20px" }}>Website Basic Setup</h2>

						<Tabs activeKey={activeTab} onChange={handleTabChange}>
							<TabPane tab='Home' key='home'>
								<HomeSection
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>

							<TabPane tab='Home Extra' key='homeExtra'>
								<HomeExtraSections
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>

							<TabPane tab='About Us' key='about'>
								<AboutUsSection
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>

							<TabPane tab='Contact Us' key='contact'>
								<ContactUsSection
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>

							<TabPane tab='T&C (Guests)' key='tcGuests'>
								<TermsGuestsSection
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>

							<TabPane tab='T&C (B2B)' key='tcB2B'>
								<TermsB2BSection
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>

							<TabPane tab='Privacy Policy' key='privacy'>
								<PrivacyPolicySection
									websiteData={websiteData}
									setWebsiteData={setWebsiteData}
								/>
							</TabPane>
						</Tabs>

						<div style={{ marginTop: "60px" }}>
							<Button
								type='primary'
								loading={loading}
								onClick={handleSaveChanges}
							>
								Save Changes
							</Button>
						</div>
					</div>
				</div>
			</div>
		</WebsiteMainWrapper>
	);
};

export default WebsiteMain;

/* ------------------- STYLED COMPONENTS ----------------- */
const WebsiteMainWrapper = styled.div`
	min-height: 300px;
	overflow-x: hidden;
	margin-top: 20px;

	.grid-container-main {
		display: grid;
		grid-template-columns: ${(props) => (props.show ? "5% 75%" : "17% 75%")};
	}

	.container-wrapper {
		border: 2px solid lightgrey;
		padding: 20px;
		border-radius: 20px;
		background: var(--mainWhite);
		margin: 0px 10px;
		width: 100%;
	}
`;
