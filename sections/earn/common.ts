import styled from 'styled-components';
import { FlexDiv, FlexDivColCentered, FlexDivCentered, ExternalLink } from 'styles/common';
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
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
`;

export const Label = styled.p`
	width: 90%;
	margin: 0 auto;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
`;

export const HeaderLabel = styled(Label)`
	padding-bottom: 24px;
`;

export const StyledLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;

export const Title = styled.div<{ isStakingPanel?: boolean }>`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: ${(props) => (props.isStakingPanel ? '5px' : '20px')};
`;

const Header = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	line-height: 17px;
	margin-bottom: 5px;
`;

export const GreyHeader = styled(Header)`
	color: ${(props) => props.theme.colors.gray};
`;

export const WhiteSubheader = styled(Header)`
	color: ${(props) => props.theme.colors.white};
`;

export const GreyText = styled.div`
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
	margin-bottom: 5px;
	text-align: center;
`;

export const LinkText = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.blue};
`;

export const Divider = styled.div`
	background: ${(props) => props.theme.colors.grayBlue};
	height: 1px;
	width: 257px;
	margin-top: 20px;
	margin-bottom: 20px;
`;

export const StyledButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 80%;
	text-transform: uppercase;
	height: 40px;
	background: ${(props) => props.theme.colors.blue};
`;

export const TabContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: space-evenly;
	padding: 24px;
`;

export const IconWrap = styled(FlexDivCentered)`
	width: 64px;
	height: 67px;
	justify-content: center;
`;

export const VerifyButton = styled.div<{ isStakingPanel?: boolean }>`
	width: ${(props) => (props.isStakingPanel ? '75px' : '125px')};
	height: 32px;
	padding-top: 8px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	border-radius: 4px;
	cursor: pointer;
	background-color: ${(props) => props.theme.colors.black};
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.gray};
	box-shadow: none;
	text-transform: uppercase;
	text-align: center;
`;

export const DismissButton = styled(Button)<{ isStakingPanel?: boolean }>`
	width: ${(props) => (props.isStakingPanel ? '75px' : '125px')};
	box-shadow: none;
`;
export const ButtonSpacer = styled(FlexDiv)<{ isStakingPanel?: boolean }>`
	width: ${(props) => (props.isStakingPanel ? '180px' : '300px')};
	justify-content: space-between;
`;
