import React from "react";
import styled from "styled-components";
import { useCartContext } from "../cart_context";
import TermsAndConditionsDetails from "../components/TermsAndConditions/TermsAndConditionsDetails";

const TermsAndConditionsMain = () => {
	const { websiteSetup } = useCartContext();

	return (
		<TermsAndConditionsMainWrapper>
			{websiteSetup && websiteSetup.termsAndCondition ? (
				<TermsAndConditionsDetails websiteSetup={websiteSetup} />
			) : null}
		</TermsAndConditionsMainWrapper>
	);
};

export default TermsAndConditionsMain;

const TermsAndConditionsMainWrapper = styled.div`
	min-height: 1000px;
`;
