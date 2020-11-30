import styled from 'styled-components';

import { FlexDivColCentered, FlexDivRowCentered, linkCSS } from 'styles/common';
import Button from 'components/Button';
import Input from 'components/Input/Input';
import Select from 'components/Select';

export const TabContainer = styled(FlexDivColCentered)`
	height: 100%;
	width: 100%;
`;

export const InputContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.darkBlue};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
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
export const InputBox = styled(FlexDivColCentered)`
	margin: 24px auto;
	justify-content: center;
`;

export const StyledInput = styled(Input)`
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.expanded};
	text-align: center;
	margin-top: 16px;
	&:disabled {
		color: ${(props) => props.theme.colors.gray10};
	}
`;

export const InputLocked = styled.p`
	font-size: 24px;
	font-family: ${(props) => props.theme.fonts.expanded};
`;

export const StyledButton = styled(Button)<{ blue: boolean }>`
	color: ${(props) =>
		props.blue ? props.theme.colors.brightBlue : props.theme.colors.brightOrange};
	box-shadow: ${(props) =>
		props.blue
			? `0px 0px 10px rgba(0, 209, 255, 0.9)`
			: `0px 0px 8.38542px rgba(252, 135, 56, 0.6);`};
	border: ${(props) =>
		props.blue
			? `1px solid ${props.theme.colors.brightBlue}`
			: `1px solid ${props.theme.colors.brightOrange}`};
	box-sizing: border-box;
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	width: 25%;
`;

export const DataRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	margin: 16px 32px;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.linedBlue}`};
`;
export const RowTitle = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray10};
	text-transform: uppercase;
`;
export const RowValue = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	margin: 0px 8px;
`;
export const StyledCTA = styled(Button)<{ blue: boolean }>`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: ${(props) =>
		props.blue
			? `0px 0px 10px rgba(0, 209, 255, 0.9)`
			: `0px 0px 8.38542px rgba(252, 135, 56, 0.6);`};
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;

	&:disabled {
		box-shadow: none;
	}
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
`;
export const StyledLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.brightBlue};
`;

export const ValueContainer = styled(FlexDivRowCentered)`
	align-items: center;
`;
