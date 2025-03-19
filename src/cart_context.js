import React, { useContext, useReducer, useEffect } from "react";
import reducer from "./cart_reducer";
import {
	LANGUAGE_TOGGLE,
	SIDEBAR_CLOSE2,
	SIDEBAR_OPEN2,
	SET_WEBSITE_SETUP,
	FEATURED_PROPERTIES,
} from "./actions";
import { gettingFeaturedProperties, getWebsiteSetup } from "./apiCore";

const getLanguageLocalStorage = () => {
	let language = localStorage.getItem("lang");
	if (language) {
		return JSON.parse(language);
	} else {
		return "English";
	}
};

const getRoomCartLocalStorage = () => {
	let cart = localStorage.getItem("roomCart");
	if (cart) {
		return JSON.parse(cart);
	} else {
		return [];
	}
};

const initialState = {
	isSidebarOpen: false,
	chosenLanguage: getLanguageLocalStorage(),
	roomCart: getRoomCartLocalStorage(),
	total_rooms: 0,
	total_price: 0,
	websiteSetup: null, // <-- new
	featuredProperties: null, // <-- featured
};

const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// 1) Functions for language and sidebars
	const languageToggle = (passedLanguage) => {
		dispatch({ type: LANGUAGE_TOGGLE, payload: passedLanguage });
	};

	const openSidebar2 = () => {
		dispatch({ type: SIDEBAR_OPEN2 });
	};

	const closeSidebar2 = () => {
		dispatch({ type: SIDEBAR_CLOSE2 });
	};

	// 2) Fetch website setup once on mount
	useEffect(() => {
		// If you do require userId/token, pass them in.
		// If not, just remove them from getWebsiteSetup’s signature.
		const fetchData = async () => {
			try {
				// Adjust if you need userId/token
				// or remove if the endpoint is public
				const userId = "";
				const token = "";
				const data = await getWebsiteSetup(userId, token);
				// data should be the object returned from your /website-basic-setup endpoint
				dispatch({ type: SET_WEBSITE_SETUP, payload: data });
			} catch (error) {
				console.error("Error fetching Website Setup: ", error);
			}
		};

		//Fetching FeaturedProducts
		const fetchFeaturedData = async () => {
			try {
				// Adjust if you need userId/token
				// or remove if the endpoint is public
				const userId = "";
				const token = "";
				const data2 = await gettingFeaturedProperties(userId, token);
				// data should be the object returned from your /website-basic-setup endpoint
				dispatch({ type: FEATURED_PROPERTIES, payload: data2 });
			} catch (error) {
				console.error("Error fetching Website Setup: ", error);
			}
		};

		fetchData();
		fetchFeaturedData();
	}, []); // empty deps => runs once

	// 3) Provide everything in context
	return (
		<CartContext.Provider
			value={{
				...state,
				languageToggle,
				openSidebar2,
				closeSidebar2,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCartContext = () => {
	return useContext(CartContext);
};
