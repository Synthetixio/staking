import styled from 'styled-components';

import { FlexDivColCentered, FlexDivCol } from 'styles/common';
import Button from 'components/Button';

export const TabContainer = styled(FlexDivColCentered)`
	min-height: 400px;
	width: 100%;
`;

export const InfoContainer = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.navy};
	padding: 16px 0px;
`;

export const Title = styled.h3`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
	margin: 8px 24px;
`;

export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	min-height: 50px;
	margin: 8px 24px;
`;

export const InputContainer = styled(FlexDivColCentered)`
	justify-content: space-between;
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const InputBox = styled(FlexDivColCentered)`
	margin: 24px auto;
	justify-content: center;
`;

export const StyledCTA = styled(Button)<{ blue: boolean; disabled: boolean }>`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: ${(props) =>
		props.blue
			? `0px 0px 10px rgba(0, 209, 255, 0.9)`
			: `0px 0px 8.38542px rgba(252, 135, 56, 0.6);`};
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;
