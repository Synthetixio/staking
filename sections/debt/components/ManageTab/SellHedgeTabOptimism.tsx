import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import { StyledHedgeInput, StyledInputLabel } from './hedge-tab-ui-components';

export default function SellHedgeTabOptimism() {
	return (
		<StyledSellHedgeContainer>
			<StyledInputLabel>dSNX</StyledInputLabel>
			<StyledHedgeInput></StyledHedgeInput>
			<StyledInputLabel>SUSD</StyledInputLabel>
			<StyledHedgeInput></StyledHedgeInput>
		</StyledSellHedgeContainer>
	);
}
const StyledSellHedgeContainer = styled(FlexDivColCentered)`
	width: 100%;
	min-height: 100%;
`;
