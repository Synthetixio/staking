import React from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type ChartLabelProps = {
	labelColor: string;
	labelBorderColor: string;
};

type ChartLabelIconProps = {
	color: string;
	borderColor: string;
};

const ChartLabel: React.FC<ChartLabelProps> = ({ labelColor, labelBorderColor, children }) => {
	return (
		<FlexDivRowCentered>
			<ChartLabelIcon color={labelColor} borderColor={labelBorderColor} />
			<ChartLabelText>{children}</ChartLabelText>
		</FlexDivRowCentered>
	);
};

const ChartLabelIcon = styled.div<ChartLabelIconProps>`
	height: 10px;
	width: 10px;
	background-color: ${(props) => props.color};
	margin-right: 10px;
	border: 2px solid ${(props) => props.borderColor};
`;

const ChartLabelText = styled.span`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.extended};
`;

export default ChartLabel;
