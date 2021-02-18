import styled from 'styled-components';
import { FlexDivCol, FlexDivColCentered, FlexDivRowCentered } from 'styles/common';

export const InputContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	height: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

export const Divider = styled.div`
	background: ${(props) => props.theme.colors.grayBlue};
	height: 1px;
	width: 100%;
	margin-top: 20px;
	margin-bottom: 20px;
`;

export const Blockie = styled.img`
	width: 25px;
	height: 25px;
	border-radius: 12.5px;
	margin-right: 10px;
`;

export const Row = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
`;

export const Card = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	margin-bottom: 16px;
	padding: 16px;
	width: 100%;
`;

export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.gray};
`;

export const LeftCol = styled(FlexDivCol)`
	width: 700px;
	margin-right: 8px;
`;
export const RightCol = styled(FlexDivCol)`
	width: 400px;
	margin-left: 8px;
`;
