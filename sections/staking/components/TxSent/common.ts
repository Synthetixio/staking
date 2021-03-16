import styled from 'styled-components';
import { ExternalLink, FlexDivColCentered, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColCentered)`
	width: 100%;
	height: 600px;
	margin: 0 auto;
	text-align: center;
	padding: 48px 24px;
	background: ${(props) => props.theme.colors.black};
	justify-content: space-evenly;
`;

export const SectionHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	text-align: center;
`;

export const MiddleSection = styled(FlexDivColCentered)`
	padding: 16px 0px;
	width: 100%;
	justify-content: center;
`;

export const IconContainer = styled(FlexDivRowCentered)`
	justify-content: center;
	padding: 16px 0px;
`;

export const InfoContainer = styled(FlexDivColCentered)`
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	width: 150px;
	height: 100px;
	padding: 24px;
	&:first-child {
		border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	}
`;

export const InfoTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
	font-size: 12px;
`;

export const InfoData = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	margin: 16px 0px;
`;

export const SectionSubtext = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
	margin: 16px 0px;
`;

export const StyledExternalLink = styled(ExternalLink)`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.blue};
	font-size: 12px;
`;
