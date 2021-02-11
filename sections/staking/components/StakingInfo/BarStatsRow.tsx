import { FC } from 'react';
import styled from 'styled-components';

import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import ProgressBar from 'components/ProgressBar';

type BarStatsRowProps = {
	title: string;
	value: string;
	percentage: number;
};

const BarStatsRow: FC<BarStatsRowProps> = ({ title, value, percentage }) => (
	<BarStatBox>
		<FlexDivRowCentered>
			<BarTitle>{title}</BarTitle>
			<BarValue>{value}</BarValue>
		</FlexDivRowCentered>
		<StyledProgressBar percentage={percentage} variant="blue" />
	</BarStatBox>
);

export const BarStatBox = styled(FlexDivCol)`
	width: 100%;
	padding: 0 24px;
	margin-top: 18px;
	&:last-child {
		margin-bottom: 45px;
		margin-top: -10px;
	}
`;

export const BarTitle = styled(FlexDivCentered)`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

export const BarValue = styled.span`
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

export const StyledProgressBar = styled(ProgressBar)`
	height: 6px;
	margin: 10px 0;
`;

export default BarStatsRow;
