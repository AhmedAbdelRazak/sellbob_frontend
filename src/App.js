import React, { useEffect } from "react";
import "./App.css";
import { Route, Switch, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css";
import { useCartContext } from "./cart_context";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import ListYourProperty from "./pages/ListYourProperty";
import OurProperties from "./pages/OurProperties";
import Contact from "./pages/Contact";
import Aboutus from "./pages/Aboutus";
import SinglePropertyPage from "./pages/SinglePropertyPage";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

//Agent Routes
import AgentRoute from "./auth/AgentRoute";
import AgentDashboardMain from "./agentModule/AgentDashboard/AgentDashboardMain";
import ListingsMain from "./agentModule/AgentListings/ListingsMain";
import CustomerServiceAgentMain from "./agentModule/CustomerService/CustomerServiceAgentMain";
import ChatIcon from "./Chat/ChatIcon";
import AppointmentManagementMain from "./agentModule/AgentAppointmentManagement/AppointmentManagementMain";
import SubscriptionMain from "./agentModule/Subscription/SubscriptionMain";
import CampaignsMain from "./agentModule/Campaigns/CampaignsMain";

//Overall Admin Routes
import AdminRoute from "./auth/AdminRoute";
import AdminDashboardMain from "./adminModule/AdminMainDashboard/AdminDashboardMain";
import WebsiteMain from "./adminModule/Website/WebsiteMain";
import CustomerServiceMain from "./adminModule/CustomerService/CustomerServiceMain";
import OverallAppointmentsMain from "./adminModule/Appointments/OverallAppointmentsMain";
import OverallSubscriptionsMain from "./adminModule/Subscriptions/OverallSubscriptionsMain";
import AccountUpdateMain from "./agentModule/AccountUpdate/AccountUpdateMain";

const App = () => {
	const location = useLocation(); // from react-router-dom
	const shouldHideChat =
		location.pathname.includes("/agent/") ||
		location.pathname.includes("/admin/");
	// Hide footer if path includes agent or admin
	const shouldHideFooter =
		location.pathname.includes("/agent") ||
		location.pathname.includes("/admin");

	const { languageToggle, chosenLanguage } = useCartContext();

	const languageToggle2 = () => {
		localStorage.setItem("lang", JSON.stringify(chosenLanguage));
		// window.location.reload(false);
	};

	useEffect(() => {
		languageToggle2();
		languageToggle(chosenLanguage);
		// eslint-disable-next-line
	}, [chosenLanguage]);

	// useEffect(() => {
	//   ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_MEASUREMENTID);
	//   ReactGA.send(window.location.pathname + window.location.search);

	//   // eslint-disable-next-line
	// }, [window.location.pathname]);

	return (
		<>
			<Navbar />
			<>
				<ToastContainer
					position='top-center'
					toastStyle={{ width: "auto", minWidth: "400px" }}
				/>

				<Switch>
					<Route path='/' exact component={Home} />
					<Route path='/properties' exact component={OurProperties} />
					<Route path='/contact' exact component={Contact} />
					<Route path='/about' exact component={Aboutus} />
					<Route path='/signup' exact component={Signup} />
					<Route path='/signin' exact component={Signin} />
					<Route
						path='/single-property/:state/:propertyNameSlug/:propertyId'
						exact
						component={SinglePropertyPage}
					/>

					<Route
						path='/list-your-property'
						exact
						component={ListYourProperty}
					/>

					{/* Agent Routes */}
					<AgentRoute
						path='/agent/dashboard'
						exact
						component={AgentDashboardMain}
					/>
					<AgentRoute path='/agent/listings' exact component={ListingsMain} />
					<AgentRoute path='/agent/campaign' exact component={CampaignsMain} />
					<AgentRoute
						path='/agent/subscriptions'
						exact
						component={SubscriptionMain}
					/>
					<AgentRoute
						path='/agent/appointments'
						exact
						component={AppointmentManagementMain}
					/>

					<AgentRoute
						path='/agent/customer-service'
						exact
						component={CustomerServiceAgentMain}
					/>

					<AgentRoute
						path='/agent/account-update'
						exact
						component={AccountUpdateMain}
					/>

					{/* Admin Routes */}
					<AdminRoute
						path='/admin/dashboard'
						exact
						component={AdminDashboardMain}
					/>
					<AdminRoute
						path='/admin/website-adjustments'
						exact
						component={WebsiteMain}
					/>
					<AdminRoute
						path='/admin/customer-service'
						exact
						component={CustomerServiceMain}
					/>
					<AdminRoute
						path='/admin/overall-appointments'
						exact
						component={OverallAppointmentsMain}
					/>
					<AdminRoute
						path='/admin/overall-subscriptions'
						exact
						component={OverallSubscriptionsMain}
					/>
					<AdminRoute
						path='/admin/overall-campaigns'
						exact
						component={OverallSubscriptionsMain}
					/>

					{/* 404 PAGE for any unmatched route */}
					<Route component={NotFound} />
				</Switch>
			</>
			{!shouldHideChat && <ChatIcon />}

			{/* Conditionally render Footer if not on agent/admin path */}
			{!shouldHideFooter && <Footer />}
		</>
	);
};

export default App;
