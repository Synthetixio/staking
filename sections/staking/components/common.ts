import styled from 'styled-components';

import { FlexDivColCentered, FlexDivRowCentered, FlexDivCol, ExternalLink } from 'styles/common';
import Button from 'components/Button';
import Input from 'components/Input/Input';
import Select from 'components/Select';

export const TabContainer = styled(FlexDivColCentered)`
	min-height: 400px;
	width: 100%;
`;

export const InfoContainer = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.navy};
	padding: 16px 0px;
`;

export const InfoHeader = styled.div`
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
	padding-bottom: 16px;
`;

export const InputContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const StyledSelect = styled(Select)`
	border: ${(props) => `2px solid ${props.theme.colors.blue}`};
	width: 100px;
	justify-content: center;
	border-radius: 4px;
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);

	.react-select__dropdown-indicator {
		color: ${(props) => props.theme.colors.blue};
		&:hover {
			color: ${(props) => props.theme.colors.blue};
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
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 16px;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

export const InputLocked = styled.p`
	font-size: 24px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 16px;
`;

export const DataRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	margin: 8px 24px;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;
export const RowTitle = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;
export const RowValue = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
`;
export const StyledCTA = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
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
	margin: 8px 24px;
`;
export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin: 8px 24px;
`;
export const DataContainer = styled.div`
	width: 100%;
`;
export const StyledLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;

export const ValueContainer = styled(FlexDivRowCentered)`
	align-items: center;
`;

export const Tagline = styled.span`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
	text-transform: capitalize;
	margin: 0px 8px;
`;
