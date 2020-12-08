import styled from 'styled-components';
import { FlexDiv, linkCSS, FlexDivColCentered } from 'styles/common';
import Button from 'components/Button';

export const TotalValueWrapper = styled(FlexDiv)`
	justify-content: space-between;
	height: 30px;
	align-items: center;
	border-bottom: 1px solid ${(props) => props.theme.colors.gray};
	width: 80%;
	margin-top: 15px;
`;

export const Subtext = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
`;

export const Value = styled.div`
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
`;

export const Label = styled.p`
	width: 90%;
	margin: 0 auto;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
`;

export const StyledLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.brightBlue};
`;

export const StyledButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 80%;
	text-transform: uppercase;
	height: 40px;
	backgroundcolor: ${(props) => props.theme.colors.brightBlue};
`;

export const TabContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: space-evenly;
	padding: 24px;
`;
