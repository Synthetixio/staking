import styled from 'styled-components';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';

export const BarStatBox = styled(FlexDivCol)`
	width: 100%;
	margin-bottom: 35px;
	&:last-child {
		margin-bottom: 45px;
		margin-top: 0;
	}
`;

export const BarHeaderSection = styled(FlexDivRowCentered)``;

export const BarTitle = styled(FlexDivCentered)`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

export const BarValue = styled.p`
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;
