import styled from 'styled-components';

import { FlexDivColCentered } from 'styles/common';

export const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
	margin: 8px 24px;
`;
export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	height: 50px;
	margin: 8px 35%;
`;

export const Header = styled.p`
    color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 16px;
    padding-bottom: 20px;
`;

export const Container = styled(FlexDivColCentered)`
    padding: 20px;
`;
