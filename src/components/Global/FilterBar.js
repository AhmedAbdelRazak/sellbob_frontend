// FilterBar.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { indianStatesArray } from "../../agentModule/utils";

const FilterBar = ({ activeStatesAndCities }) => {
	// Local state for listing
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);

	// User’s currently selected values
	const [selectedCountry, setSelectedCountry] = useState("");
	const [selectedState, setSelectedState] = useState("");
	const [selectedCity, setSelectedCity] = useState("");

	// Stores URL query params (if any)
	const [initialQuery, setInitialQuery] = useState({
		country: "",
		state: "",
		city: "",
	});

	// 1) Initialize countries/states/cities from the API response + read query params
	useEffect(() => {
		if (!activeStatesAndCities) return;

		// Filter out any empty strings
		const filteredCountries =
			activeStatesAndCities.propertyCountries?.filter(Boolean) || [];
		const filteredStates =
			activeStatesAndCities.propertyStates?.filter(Boolean) || [];
		const filteredCities =
			activeStatesAndCities.propertyCities?.filter(Boolean) || [];

		// Sort them alphabetically
		filteredCountries.sort();
		filteredStates.sort();
		filteredCities.sort();

		setCountries(filteredCountries);
		setStates(filteredStates);
		setCities(filteredCities);

		// Parse query params from the URL
		const params = new URLSearchParams(window.location.search);
		const countryParam = params.get("country") || "";
		const stateParam = params.get("state") || "";
		const cityParam = params.get("city") || "";

		setInitialQuery({
			country: countryParam,
			state: stateParam,
			city: cityParam,
		});

		// If no countryParam but there's only 1 country, auto-select that
		if (!countryParam && filteredCountries.length === 1) {
			setSelectedCountry(filteredCountries[0]);
		}
		// Otherwise, if the param is valid in the list, set it
		else if (
			countryParam &&
			filteredCountries.includes(countryParam.toLowerCase())
		) {
			// Note: if your DB returns all-lowercase, ensure matching here
			setSelectedCountry(countryParam.toLowerCase());
		} else if (countryParam && filteredCountries.includes(countryParam)) {
			// If the data is already in correct case
			setSelectedCountry(countryParam);
		}
		// else do nothing, user can pick
	}, [activeStatesAndCities]);

	// 2) When selectedCountry changes, re-check possible states
	useEffect(() => {
		if (!selectedCountry) {
			// Reset states & cities if no country chosen
			setSelectedState("");
			setSelectedCity("");
			return;
		}

		// Filter states relevant for this country (if needed)
		let filteredStates =
			activeStatesAndCities?.propertyStates?.filter(Boolean) || [];
		filteredStates.sort();
		setStates(filteredStates);

		// If the user came from a URL param, see if it's valid
		if (initialQuery.state && filteredStates.includes(initialQuery.state)) {
			setSelectedState(initialQuery.state);
		}
		// If no param but there is only 1 state, auto-select
		else if (filteredStates.length === 1) {
			setSelectedState(filteredStates[0]);
		} else {
			// Otherwise, let them choose
			setSelectedState("");
			setSelectedCity("");
		}
	}, [selectedCountry, activeStatesAndCities, initialQuery.state]);

	// 3) When selectedState changes, filter city options using indianStatesArray
	useEffect(() => {
		if (!selectedState) {
			setSelectedCity("");
			return;
		}

		// Find this state in your big array
		const foundState = indianStatesArray.find(
			(st) => st.name.toLowerCase() === selectedState.toLowerCase()
		);

		if (!foundState) {
			// If for some reason not found, fallback to existing city list
			let fallbackCities =
				activeStatesAndCities?.propertyCities?.filter(Boolean) || [];
			fallbackCities.sort();
			setCities(fallbackCities);
			return;
		}

		// Combine majorCities & districts as possible city names
		const majorCities = foundState.majorCities?.map((c) =>
			c.name.toLowerCase()
		);
		const districts = foundState.districts?.map((d) => d.toLowerCase());
		const validLocations = new Set([
			...(majorCities || []),
			...(districts || []),
		]);

		// Filter out only the active propertyCities that are recognized in that set
		let matchingCities =
			activeStatesAndCities?.propertyCities
				?.filter(Boolean)
				.filter((city) => validLocations.has(city.toLowerCase())) || [];

		// Sort them
		matchingCities.sort();
		setCities(matchingCities);

		// If the user has a city param in the URL, check if it's valid
		if (
			initialQuery.city &&
			matchingCities.includes(initialQuery.city.toLowerCase())
		) {
			// If your data is strictly lowercase
			setSelectedCity(initialQuery.city.toLowerCase());
		} else if (
			initialQuery.city &&
			matchingCities.includes(initialQuery.city)
		) {
			// If data matches case
			setSelectedCity(initialQuery.city);
		}
		// Else if there's only 1 city, auto-select
		else if (matchingCities.length === 1) {
			setSelectedCity(matchingCities[0]);
		} else {
			setSelectedCity("");
		}
	}, [selectedState, activeStatesAndCities, initialQuery.city]);

	// 4) Handle Search: redirect to /properties with query params
	const handleSearch = () => {
		const params = new URLSearchParams();
		if (selectedCountry) params.append("country", selectedCountry);
		if (selectedState) params.append("state", selectedState);
		if (selectedCity) params.append("city", selectedCity);

		window.location.href = `/properties?${params.toString()}`;
	};

	return (
		<FilterBarWrapper>
			<div className='filter-bar-container'>
				{/* Country Dropdown */}
				<select
					value={selectedCountry}
					onChange={(e) => setSelectedCountry(e.target.value)}
					disabled={countries.length <= 1}
				>
					<option value=''>Select Country</option>
					{countries.map((country, idx) => (
						<option key={idx} value={country}>
							{country}
						</option>
					))}
				</select>

				{/* State Dropdown */}
				<select
					value={selectedState}
					onChange={(e) => setSelectedState(e.target.value)}
					disabled={!selectedCountry || states.length === 0}
				>
					<option value=''>Select State</option>
					{states.map((state, idx) => (
						<option key={idx} value={state}>
							{state}
						</option>
					))}
				</select>

				{/* City Dropdown */}
				<select
					value={selectedCity}
					onChange={(e) => setSelectedCity(e.target.value)}
					disabled={!selectedState || cities.length === 0}
				>
					<option value=''>Select City</option>
					{cities.map((city, idx) => (
						<option key={idx} value={city}>
							{city}
						</option>
					))}
				</select>

				{/* Search Button */}
				<button className='search-button' onClick={handleSearch}>
					Search
				</button>
			</div>
		</FilterBarWrapper>
	);
};

export default FilterBar;

/* ------------------------------------------------------ */
/* STYLED COMPONENTS */
/* ------------------------------------------------------ */
const FilterBarWrapper = styled.div`
	width: 100%;
	background-color: var(--neutral-light2);
	padding: 20px;
	margin: auto;

	.filter-bar-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		border: 2px solid lightgrey;
		max-width: 700px;
		margin: auto;
		padding: 20px;
		border-radius: 10px;

		select {
			padding: 0.5rem;
			font-size: 1rem;
			border: 1px solid var(--border-color-light);
			border-radius: 4px;
			transition: var(--main-transition);
			text-transform: capitalize;

			&:focus {
				outline: none;
				border-color: var(--primary-color-light);
			}
			&:disabled {
				background-color: var(--neutral-light3);
				cursor: not-allowed;
			}
		}

		.search-button {
			padding: 0.5rem 1rem;
			font-size: 1rem;
			background-color: var(--button-bg-primary);
			color: var(--button-font-color);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			transition: var(--main-transition);
			&:hover {
				background-color: var(--button-bg-primary-light);
			}
		}
	}

	@media (max-width: 768px) {
		.filter-bar-container {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
`;
