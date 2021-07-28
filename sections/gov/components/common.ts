import styled from 'styled-components';
import media from 'styles/media';

import {
	FlexDiv,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRowCentered,
	Tooltip,
} from 'styles/common';
import Button from 'components/Button';

export const Container = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	padding: 20px;
`;

export const InputContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const HeaderRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

export const Header = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	text-align: center;
`;

export const Blockie = styled.img`
	width: 25px;
	height: 25px;
	border-radius: 12.5px;
	margin-right: 10px;
`;

export const DataRow = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
`;

export const Card = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	margin-bottom: 16px;
	padding: 16px;

	${media.lessThan('mdUp')`
		width: unset;
	`}
`;

export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.gray};
`;

export const Grid = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-gap: 1rem;

	${media.lessThan('mdUp')`
		display: flex;
		flex-direction: column;
	`}
`;

export const Col = styled(FlexDivCol)``;

export const StyledCTA = styled(Button)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	width: 100%;
	margin: 4px 0px;
`;

export const MaxHeightColumn = styled(FlexDivCol)`
	max-height: 400px;
	overflow-y: scroll;
`;

export const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

export const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 20px;
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

export const ButtonSpacer = styled(FlexDiv)`
	width: 300px;
	justify-content: space-between;
	margin-top: 16px;
`;

export const VerifyButton = styled.div`
	width: 145px;
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
	margin-right: 8px;
`;

export const DismissButton = styled(Button)`
	width: 100%;
	box-shadow: none;
	text-transform: uppercase;
`;
