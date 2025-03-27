import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Redirect, Link, useLocation, useHistory } from "react-router-dom";
import {
	AreaChartOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	PieChartOutlined,
	SettingOutlined,
	ImportOutlined,
	CustomerServiceOutlined,
	CreditCardOutlined,
	DollarCircleOutlined,
	ShopOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import LastAddedLogoImage from "./LastAddedLogoImage";
import { signout, isAuthenticated } from "../../auth";

function getItem(label, key, icon, children, type, className) {
	return {
		key,
		icon,
		children,
		label,
		type,
		className,
	};
}

const handleSignout = (history) => {
	signout(() => {
		history.push("/");
	});
};

const AgentNavbar = ({
	fromPage,
	setAdminMenuStatus,
	collapsed,
	setCollapsed,
}) => {
	const [clickedOn, setClickedOn] = useState(false);
	const { user } = isAuthenticated() || {};
	const location = useLocation();
	const history = useHistory();

	useEffect(() => {
		if (!user) return;

		const searchParams = new URLSearchParams(location.search);
		const existingAgent = searchParams.get("agent"); // e.g. 'agent=XYZ'
		const storedAgentId = localStorage.getItem("agentId")?.trim() || "";

		// Choose finalAgentId from localStorage or fallback to user._id
		const finalAgentId = storedAgentId
			? storedAgentId
			: user && user._id
				? user._id
				: "noUser";

		// If the current URL param is different than finalAgentId, update it
		if (existingAgent !== finalAgentId) {
			searchParams.set("agent", finalAgentId);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
		}
	}, [location, history, user]);

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
		setAdminMenuStatus(!collapsed);
	};

	const items = [
		getItem(
			<div className='logoClass'></div>,
			"StoreLogo",
			<LastAddedLogoImage />
		),
		getItem(
			<div className='logoClass '></div>,
			"StoreLogo",
			<div className='logoClass no-background' style={{ width: "100%" }}>
				<hr />
			</div>
		),
		getItem(
			<Link to='/agent/dashboard'>Admin Dashboard</Link>,
			"sub1",
			<PieChartOutlined />
		),
		getItem(
			<Link to='/agent/listings' style={{ fontWeight: "bold" }}>
				Listings
			</Link>,
			"sub10",
			<DollarCircleOutlined />
		),
		getItem(
			<Link to='/agent/customer-service'>Customer Service</Link>,
			"sub2",
			<AreaChartOutlined />
		),
		getItem(
			<Link to='/agent/appointments'>Appointments</Link>,
			"sub3",
			<SettingOutlined />
		),
		getItem(
			<Link to='/agent/subscriptions'>Subscriptions</Link>,
			"sub4",
			<ShopOutlined />
		),
		getItem(
			<Link to='/agent/campaign'>Campaigns</Link>,
			"sub6",
			<AreaChartOutlined />
		),
		getItem(
			<div className='margin-divider'></div>,
			"divider1",
			null,
			null,
			"divider"
		),
		getItem(
			<Link to='/agent/account-update'>Account Update</Link>,
			"sub13",
			<ImportOutlined />,
			null,
			null,
			"black-bg"
		),
		getItem(
			"CRM",
			"sub14",
			<CustomerServiceOutlined />,
			null,
			null,
			"black-bg"
		),
		getItem(
			"POS & Products",
			"sub15",
			<ShopOutlined />,
			null,
			null,
			"black-bg"
		),
		getItem(
			"Financials",
			"sub16",
			<DollarCircleOutlined />,
			null,
			null,
			"black-bg"
		),
		getItem(
			"Employee Accounts",
			"sub17",
			<TeamOutlined />,
			null,
			null,
			"black-bg"
		),
		getItem(
			<div className='margin-divider'></div>,
			"divider2",
			null,
			null,
			"divider2"
		),
		getItem("Payments", "sub18", <CreditCardOutlined />, null, null, "red-bg"),
		getItem(
			<div style={{ fontWeight: "bold", textDecoration: "underline" }}>
				Signout
			</div>,
			"signout",
			<CreditCardOutlined />,
			null,
			null,
			"reddish-bg"
		),
	];

	return (
		<AgentNavbarWrapper
			show={collapsed}
			show2={clickedOn}
			style={{
				width: 285,
			}}
		>
			<Button
				type='primary'
				onClick={toggleCollapsed}
				style={{
					marginBottom: 8,
					textAlign: "center",
				}}
			>
				{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
			</Button>

			<Menu
				defaultSelectedKeys={[
					fromPage === "AdminDasboard"
						? "sub1"
						: fromPage === "Support"
							? "sub2"
							: fromPage === "Appointments"
								? "sub3"
								: fromPage === "Subscriptions"
									? "sub4"
									: fromPage === "StoreBilling"
										? "sub5"
										: fromPage === "Campaigns"
											? "sub6"
											: fromPage === "AccountUpdate"
												? "sub13"
												: fromPage === "AddProducts"
													? "sub8"
													: fromPage === "Listings"
														? "sub10"
														: fromPage === "CouponManagement"
															? "sub12"
															: "sub1",
				]}
				mode='inline'
				theme='dark'
				inlineCollapsed={collapsed}
				items={items}
				onClick={(e) => {
					if (e.key === "signout") {
						handleSignout(history);
						return;
					}
					if (e.key === "StoreLogo") {
						setClickedOn(true);
					} else {
						setClickedOn(false);
					}
					return <Redirect to={e.key} />;
				}}
			/>
		</AgentNavbarWrapper>
	);
};

export default AgentNavbar;

/* ----------------- Styled Components ----------------- */
const AgentNavbarWrapper = styled.div`
	margin-bottom: 15px;
	background: ${(props) => (props.show ? "" : "var(--primaryBlueDarker)")};
	top: 0px !important;
	z-index: 20000;
	overflow: auto;
	position: fixed;
	padding: 0px !important;

	ul {
		height: 90vh !important;
	}

	.logoClass {
		display: ${(props) => (props.show ? "none " : "block")} !important;
	}

	li {
		font-size: 0.9rem;
		margin-bottom: ${(props) => (props.show ? "20px " : "15px")};
	}

	hr {
		color: white !important;
		background: white !important;
	}

	.ant-menu.ant-menu-inline-collapsed {
		min-height: 850px;
	}

	.ant-menu.ant-menu-dark,
	.ant-menu-dark .ant-menu-sub,
	.ant-menu.ant-menu-dark .ant-menu-sub {
		color: rgba(255, 255, 255, 0.65);
		background: var(--primaryBlueDarker) !important;
	}

	.ant-menu-item-selected {
		background: ${(props) => (props.show2 ? "none !important" : "")};
	}

	.black-bg {
		background-color: #0e0e15 !important;
		&:hover {
			background-color: #001427 !important;
		}
	}

	.red-bg {
		background-color: #270000 !important;
		&:hover {
			background-color: #270000 !important;
		}
	}

	.ant-menu-item-selected {
		background: black !important;
	}

	@media (max-width: 1650px) {
		background: ${(props) => (props.show ? "" : "transparent")};

		ul {
			width: 250px;
			padding: 0px !important;
			margin: 0px !important;
		}

		ul > li {
			font-size: 0.8rem !important;
		}
	}

	@media (max-width: 1200px) {
		width: ${(props) => (props.show ? "20%" : "60%")} !important;

		ul {
			display: ${(props) => (props.show ? "none" : "")};
			margin-top: 0px !important;
			top: 0px !important;
		}

		.ant-menu.ant-menu-dark {
		}

		button {
			margin-top: 5px !important;
		}
	}
`;
