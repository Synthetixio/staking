import styled from 'styled-components';

import { FlexDivColCentered, FlexDivRow, FlexDivRowCentered, linkCSS } from 'styles/common';
import Button from 'components/Button';
import Input from 'components/Input/Input';
import Select from 'components/Select';

export const TabContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.darkBlue};
	height: 100%;
	justify-content: space-evenly;
`;

export const HeaderBox = styled(FlexDivRowCentered)`
	padding: 16px 0px;
	p {
		color: ${(props) => props.theme.colors.white};
		font-size: 16px;
		font-family: ${(props) => props.theme.fonts.condensedBold};
		margin-right: 16px;
	}
`;

export const StyledSelect = styled(Select)`
	border: ${(props) => `2px solid ${props.theme.colors.brightBlue}`};
	width: 100px;
	justify-content: center;
	border-radius: 4px;
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);

	.react-select__dropdown-indicator {
		color: ${(props) => props.theme.colors.brightBlue};
		&:hover {
			color: ${(props) => props.theme.colors.brightBlue};
		}
	}
	.react-select__single-value {
		font-size: 16px;
		width: 100%;
	}

	.react-select__option {
		font-size: 16px;
		width: 100%;
	}
`;
export const InputBox = styled(FlexDivRow)`
	margin: 16px auto;
	width: 300px;
`;

export const StyledInput = styled(Input)`
	font-size: 40px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 75%;
	text-align: center;
	padding-right: 16px;
`;

export const StyledButton = styled(Button)`
	color: ${(props) => props.theme.colors.brightBlue};
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border: ${(props) => `1px solid ${props.theme.colors.brightBlue}`};
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	width: 25%;
`;

export const DataRow = styled(FlexDivRow)`
	justify-content: space-between;
	margin: 16px 32px;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.linedBlue}`};
`;
export const RowTitle = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: uppercase;
`;
export const RowValue = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
`;
export const StyledCTA = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.6);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
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
export const DataContainer = styled.div`
	width: 100%;
	background: ${(props) => props.theme.colors.mediumBlue};
`;
export const StyledLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.brightBlue};
`;

export const ValueContainer = styled(FlexDivRowCentered)`
	align-items: center;
`;
