import React, { useState } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { FaBars } from "react-icons/fa"; // Hamburger icon
import {
	IoClose,
	IoHomeOutline,
	IoBusinessOutline,
	IoInformationCircleOutline,
	IoCallOutline,
	IoLogInOutline,
	IoPersonAddOutline,
	IoAddCircleOutline,
} from "react-icons/io5";

import { isAuthenticated, signout } from "../../auth";
import { useCartContext } from "../../cart_context";

const Navbar = () => {
	const [drawerOpen, setDrawerOpen] = useState(false);

	// Access the global websiteSetup from context
	const { websiteSetup } = useCartContext();

	// Retrieve current user if logged in
	const { user } = isAuthenticated() || {};
	const history = useHistory();

	// Extract user’s first name if available
	let firstName = "";
	if (user && user.name) {
		firstName = user.name.split(" ")[0];
	}

	const toggleDrawer = () => {
		setDrawerOpen(!drawerOpen);
	};

	const handleSignout = () => {
		signout(() => {
			window.location.href = "/";
		});
	};

	// Handle the "Hi {firstName}" click → route by role
	const handleUserDashboard = () => {
		if (user && user.role === 2000) {
			history.push("/agent/dashboard");
		} else if (user && user.role === 1000) {
			history.push("/admin/dashboard");
		} else {
			// default for other roles, e.g. role=0 or none
			history.push("/customer/dashboard");
		}
	};

	// Check if a custom logo URL is provided
	const logoUrl =
		websiteSetup && websiteSetup.sellbobLogo && websiteSetup.sellbobLogo.url
			? websiteSetup.sellbobLogo.url
			: "";

	return (
		<>
			<NavContainer>
				{/* Left: Logo */}
				<NavLeft>
					{logoUrl ? (
						// If logoUrl is set, show the image
						<a href='/'>
							<LogoImg src={logoUrl} alt='Site Logo' />
						</a>
					) : (
						// Otherwise, show text fallback
						<Logo to='/'>
							Real<span>Estate</span>
						</Logo>
					)}
				</NavLeft>

				{/* Center: main nav links (no icons on desktop) */}
				<NavCenter>
					<NavItem to='/'>Home</NavItem>
					<NavItem to='/properties'>Our Properties</NavItem>
					<NavItem to='/about'>About</NavItem>
					<NavItem to='/contact'>Contact</NavItem>
				</NavCenter>

				{/* Right side: show different links depending on user logged in or not */}
				<NavRight>
					{user && user.name ? (
						<>
							{/* If logged in, show "Hi FirstName" + "Sign Out" */}
							<RightItem
								as='div'
								onClick={handleUserDashboard}
								style={{ color: "lightblue", textDecoration: "underline" }}
							>
								Hi {firstName}
							</RightItem>
							<RightItem
								style={{ color: "lightpink", textDecoration: "underline" }}
								as='div'
								onClick={handleSignout}
							>
								Sign Out
							</RightItem>
						</>
					) : (
						<>
							{/* Not logged in => show Sign In, Sign Up, List Property */}
							<RightItem to='/signin'>
								<IoLogInOutline style={{ marginRight: "6px" }} />
								Sign In
							</RightItem>
							<RightItem to='/signup'>
								<IoPersonAddOutline style={{ marginRight: "6px" }} />
								Sign Up
							</RightItem>
							<ListPropertyItem to='/list-your-property'>
								<IoAddCircleOutline style={{ marginRight: "6px" }} />
								List Your Property
							</ListPropertyItem>
						</>
					)}
				</NavRight>

				{/* Hamburger (for mobile) */}
				<Hamburger onClick={toggleDrawer}>
					<FaBars />
				</Hamburger>
			</NavContainer>

			{/* Dark overlay behind the side drawer (click to close) */}
			{drawerOpen && <Overlay onClick={toggleDrawer} />}

			{/* Side Drawer */}
			<Drawer open={drawerOpen}>
				<CloseIcon onClick={toggleDrawer}>
					<IoClose size={28} />
				</CloseIcon>

				{/* Drawer top: logo */}
				<DrawerTop>
					{logoUrl ? (
						<DrawerLogoImg to='/' onClick={toggleDrawer}>
							<LogoImg src={logoUrl} alt='Site Logo' />
						</DrawerLogoImg>
					) : (
						<DrawerLogo to='/' onClick={toggleDrawer}>
							Real<span>Estate</span>
						</DrawerLogo>
					)}
				</DrawerTop>

				{/* Main links section */}
				<DrawerLinks>
					<DrawerItem to='/' onClick={toggleDrawer}>
						<IoHomeOutline style={{ marginRight: "8px" }} />
						Home
					</DrawerItem>
					<DrawerItem to='/properties' onClick={toggleDrawer}>
						<IoBusinessOutline style={{ marginRight: "8px" }} />
						Our Properties
					</DrawerItem>
					<DrawerItem to='/about' onClick={toggleDrawer}>
						<IoInformationCircleOutline style={{ marginRight: "8px" }} />
						About
					</DrawerItem>
					<DrawerItem to='/contact' onClick={toggleDrawer}>
						<IoCallOutline style={{ marginRight: "8px" }} />
						Contact
					</DrawerItem>
				</DrawerLinks>

				<Divider />

				{/* Auth / ListYourProperty or "Hi {firstName}" / "Sign Out" */}
				<DrawerLinks>
					{user && user.name ? (
						<>
							<DrawerItem
								as='div'
								onClick={() => {
									toggleDrawer();
									handleUserDashboard();
								}}
							>
								Hi {firstName}
							</DrawerItem>
							<DrawerItem
								as='div'
								onClick={() => {
									toggleDrawer();
									handleSignout();
								}}
							>
								Sign Out
							</DrawerItem>
						</>
					) : (
						<>
							<DrawerItem to='/signin' onClick={toggleDrawer}>
								<IoLogInOutline style={{ marginRight: "8px" }} />
								Sign In
							</DrawerItem>
							<DrawerItem to='/signup' onClick={toggleDrawer}>
								<IoPersonAddOutline style={{ marginRight: "8px" }} />
								Sign Up
							</DrawerItem>
							<ListDrawerItem to='/list-your-property' onClick={toggleDrawer}>
								<IoAddCircleOutline style={{ marginRight: "8px" }} />
								List Your Property
							</ListDrawerItem>
						</>
					)}
				</DrawerLinks>
			</Drawer>
		</>
	);
};

/* -------------------------------------- */
/*             STYLED COMPONENTS          */
/* -------------------------------------- */

const NavContainer = styled.nav`
	width: 100%;
	height: 70px;
	background: var(--primary-color-dark);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 1.5rem;
	position: relative;
	box-shadow: var(--box-shadow-dark);

	@media (max-width: 768px) {
		justify-content: flex-start;
	}
`;

const NavLeft = styled.div`
	display: flex;
	align-items: center;
`;

/* Logo image (when you have a valid logoUrl) */
const LogoImg = styled.img`
	height: 50px;
	width: auto;
	cursor: pointer;
	object-fit: contain;
`;

/* Fallback text-based logo */
const Logo = styled(Link)`
	font-size: 1.5rem;
	color: var(--accent-color-1);
	text-decoration: none;
	font-weight: bold;

	span {
		color: var(--secondary-color);
	}
`;

const NavCenter = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;

	@media (max-width: 950px) {
		gap: 0.75rem;
	}

	@media (max-width: 768px) {
		display: none; /* hide center links on mobile */
	}
`;

const NavRight = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	font-weight: bolder;

	@media (max-width: 768px) {
		display: none; /* hide right links on mobile */
	}
`;

const RightItem = styled(Link)`
	color: var(--text-color-light);
	text-decoration: none;
	font-size: 1rem;
	padding: 0.5rem;
	transition: var(--main-transition);
	display: flex;
	align-items: center;
	cursor: pointer;

	&:hover {
		color: var(--accent-color-1-dark);
		transform: scale(1.05);
	}
`;

const ListPropertyItem = styled(RightItem)`
	font-family: "Georgia", serif;
	text-decoration: underline;
	font-weight: bold;
	color: var(--accent-color-1);

	&:hover {
		text-decoration: underline;
		color: var(--accent-color-1-dark);
	}
`;

const NavItem = styled(Link)`
	color: var(--text-color-light);
	text-decoration: none;
	font-size: 1rem;
	padding: 0.5rem;
	transition: var(--main-transition);

	&:hover {
		color: var(--accent-color-1-dark);
		transform: scale(1.05);
	}
`;

const Hamburger = styled.div`
	display: none;
	color: var(--text-color-light);
	font-size: 1.5rem;
	cursor: pointer;

	@media (max-width: 768px) {
		display: block;
		margin-left: auto;
	}
`;

/* Dark overlay behind the Drawer */
const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	z-index: 998; /* behind the drawer (999) */
`;

/* Side Drawer */
const Drawer = styled.div`
	position: fixed;
	top: 0;
	left: ${({ open }) => (open ? "0" : "-100%")};
	width: 60%;
	max-width: 300px;
	height: 100vh;
	background: var(--primary-color);
	box-shadow: var(--box-shadow-dark);
	transition: var(--main-transition);
	display: flex;
	flex-direction: column;
	z-index: 999;
`;

const CloseIcon = styled.div`
	position: absolute;
	top: 1rem;
	right: 1rem;
	cursor: pointer;
	color: var(--text-color-light);
`;

const DrawerTop = styled.div`
	padding: 1rem;
`;

/* Fallback text-based Drawer logo */
const DrawerLogo = styled(Link)`
	font-size: 1.2rem;
	color: var(--accent-color-1);
	text-decoration: none;
	font-weight: bold;

	span {
		color: var(--secondary-color);
	}
`;

/* If there's a logo in the drawer */
const DrawerLogoImg = styled(Link)`
	display: inline-block;
`;

const DrawerLinks = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: 0.5rem;
`;

const DrawerItem = styled(Link)`
	color: var(--text-color-light);
	text-decoration: none;
	font-size: 1.2rem;
	padding: 1rem;
	transition: var(--main-transition);
	display: flex;
	align-items: center;
	cursor: pointer;

	&:hover {
		background: var(--primary-color-darker);
		color: var(--accent-color-1);
		padding-left: 1.5rem;
	}
`;

const ListDrawerItem = styled(DrawerItem)`
	font-family: "Georgia", serif;
	text-decoration: underline;
	font-weight: bold;
	color: var(--accent-color-1);

	&:hover {
		text-decoration: underline;
		color: var(--accent-color-1-dark);
	}
`;

const Divider = styled.hr`
	width: 90%;
	margin: 1rem auto;
	border: none;
	border-top: 1px solid var(--accent-color-1-dark);
`;

export default Navbar;
