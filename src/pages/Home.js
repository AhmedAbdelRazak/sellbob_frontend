import React from "react";
import styled from "styled-components";
import { useCartContext } from "../cart_context";
import Hero from "../components/Home/Hero";
import Featured from "../components/Home/Featured";
import ExtraSections from "../components/Home/ExtraSections";

const Home = () => {
	const { websiteSetup, featuredProperties } = useCartContext();

	return (
		<HomeWrapper>
			<Hero websiteSetup={websiteSetup} />
			{featuredProperties && featuredProperties.length > 0 ? (
				<Featured
					websiteSetup={websiteSetup}
					featuredProperties={featuredProperties}
				/>
			) : null}

			<ExtraSections websiteSetup={websiteSetup} />
		</HomeWrapper>
	);
};

export default Home;

const HomeWrapper = styled.div`
	min-height: 1400px;
`;
