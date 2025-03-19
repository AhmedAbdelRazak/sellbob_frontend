import {
	LANGUAGE_TOGGLE,
	SIDEBAR_OPEN2,
	SIDEBAR_CLOSE2,
	SET_WEBSITE_SETUP,
	FEATURED_PROPERTIES,
} from "./actions";

const cart_reducer = (state, action) => {
	if (action.type === LANGUAGE_TOGGLE) {
		return { ...state, chosenLanguage: action.payload };
	}

	if (action.type === SIDEBAR_OPEN2) {
		return { ...state, isSidebarOpen2: true };
	}

	if (action.type === SIDEBAR_CLOSE2) {
		return { ...state, isSidebarOpen2: false };
	}

	// Handle new action:
	if (action.type === SET_WEBSITE_SETUP) {
		return { ...state, websiteSetup: action.payload };
	}

	if (action.type === FEATURED_PROPERTIES) {
		return { ...state, featuredProperties: action.payload };
	}

	throw new Error(`No Matching "${action.type}" - action type`);
};

export default cart_reducer;
