import styled from 'styled-components';

import { FlexDivColCentered, linkCSS } from 'styles/common';

export const TabContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: space-evenly;
	padding: 24px;
`;
export const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
`;
export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.lightFont};
	font-size: 14px;
`;
export const StyledLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.brightBlue};
`;
