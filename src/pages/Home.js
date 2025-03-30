import React from "react";
import styled from "styled-components";
import { useCartContext } from "../cart_context";
import Hero from "../components/Home/Hero";
import Featured from "../components/Home/Featured";
import ExtraSections from "../components/Home/ExtraSections";
import FeaturedAgents from "../components/Home/FeaturedAgents";
import FilterBar from "../components/Global/FilterBar";

const Home = () => {
	const { websiteSetup, featuredProperties, activeStatesAndCities } =
		useCartContext();

	return (
		<HomeWrapper>
			<Hero websiteSetup={websiteSetup} />

			<FilterBar activeStatesAndCities={activeStatesAndCities} />
			{featuredProperties && featuredProperties.length > 0 ? (
				<Featured
					websiteSetup={websiteSetup}
					featuredProperties={featuredProperties}
				/>
			) : null}

			<ExtraSections websiteSetup={websiteSetup} />

			{featuredProperties && featuredProperties.length > 0 ? (
				<FeaturedAgents featuredProperties={featuredProperties} />
			) : null}
		</HomeWrapper>
	);
};

export default Home;

const HomeWrapper = styled.div`
	min-height: 1400px;
`;
