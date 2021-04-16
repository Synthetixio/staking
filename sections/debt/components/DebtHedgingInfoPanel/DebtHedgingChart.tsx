import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { ResponsiveContainer, XAxis, YAxis, Line, ReferenceLine, LineChart } from 'recharts';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { FlexDivColCentered, FlexDivRow, FlexDivRowCentered, Tooltip } from 'styles/common';

import useGlobalHistoricalDebtData from 'hooks/useGlobalHistoricalDebtData';
import colors from 'styles/theme/colors';
import fonts from 'styles/theme/fonts';

import SpinnerIcon from 'assets/svg/app/loader.svg';
import ChartLabel from './ChartLabel';

const DebtHedgingChart: React.FC = () => {
	const { t } = useTranslation();
	const { data, isLoading } = useGlobalHistoricalDebtData();
	// console.log(data);

	if (isLoading) {
		return (
			<SpinnerContainer>
				<Spinner src={SpinnerIcon} />
			</SpinnerContainer>
		);
	}

	return (
		<ChartContainer>
			<ChartTitleContainer>
				<p>{t('debt.actions.manage.info-panel.chart.title')}</p>
				<ChartLabel labelColor={colors.mutedBlue} labelBorderColor={colors.blue}>
					{t('debt.actions.manage.info-panel.chart.sUSD-label')}
				</ChartLabel>
				<ChartLabel labelColor={colors.mutedPink} labelBorderColor={colors.pink}>
					{t('debt.actions.manage.info-panel.chart.debtPool-label')}
				</ChartLabel>
			</ChartTitleContainer>
			<ResponsiveContainer width="100%" height={270}>
				<LineChart margin={{ left: 0, top: 20, bottom: 0, right: 0 }} data={data}>
					<XAxis
						height={30}
						dataKey="timestamp"
						interval="preserveEnd"
						tick={{ fontSize: 10, fill: colors.white, fontFamily: fonts.mono }}
						tickLine={false}
						tickFormatter={(tick) => format(new Date(tick), 'd MMM yy').toUpperCase()}
					/>
					<YAxis
						width={0}
						// axisLine={{ stroke: colors.white, strokeWidth: 1 }}
						domain={['auto', 'auto']}
						tickLine={false}
					/>
					{/* <Tooltip
						cursor={{ stroke: colors.white, strokeDasharray: 2 }}
						content={<CustomTooltip />}
						contentStyle={{
							opacity: 1,
							backgroundColor: colors.navy,
							zIndex: 1000,
							borderColor: colors.navy,
						}}
					/> */}
					<Line
						type="monotone"
						dataKey="issuance"
						stroke={colors.blue}
						strokeWidth={2}
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="debtPool"
						stroke={colors.pink}
						strokeWidth={2}
						dot={false}
					/>
					{/* <ReferenceLine y={0} isFront={false} strokeWidth={1} stroke={colors.mediumBlue} /> */}
				</LineChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
};

const ChartContainer = styled(FlexDivColCentered)`
	height: 100%;
	width: 100%;
`;

const ChartTitleContainer = styled(FlexDivRow)`
	border-top: 1px solid ${(props) => props.theme.colors.mediumBlue};
	border-bottom: 1px solid ${(props) => props.theme.colors.mediumBlue};
	font-family: ${(props) => props.theme.fonts.extended};
	width: 100%;
	font-size: 13px;
	padding-left: 30px;
	padding-right: 30px;
`;

const SpinnerContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: center;
`;

const Spinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

export default DebtHedgingChart;
