import React, { useContext } from 'react';
import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ThemeContext } from 'styled-components';
import numbro from 'numbro';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ReferenceLine,
} from 'recharts';

import { HistoricalDebtAndIssuance } from './DebtHistoryContainer';

//needed to bring these formatters forward from the old Mintr UI
export const formatCurrency = (value:number, decimals:number = 2) => {
	if (!value) return 0;
	if (!Number(value)) return 0;
	return numbro(value).format('0,0.' + '0'.repeat(decimals));
};

const LEGEND_LABELS = {
	actualDebt: 'debt-history.chart.data.actualDebt',
	issuanceDebt: 'debt-history.chart.data.issuedDebt'
};

const CustomTooltip: FC<{active:boolean, payload:Array<{color:string,name:'actualDebt'|'issuanceDebt',value:number}> | null, label:string}> = ({
	active,
	payload,
	label
}) => {
	const { t } = useTranslation();

	if (!active || !label || !payload) return null;

	return (
		<TooltipWrapper>
			<StyledH1>{format(new Date(label), 'MMM dd YYY, h:mma')}</StyledH1>
			<Legend>
				{payload.map(({ color, name, value }) => {
					return (
						<LegendRow key={`legend-${name}`}>
							<LegendName>
								<LegendIcon style={{ backgroundColor: color }} />
								<LegendText>{t(LEGEND_LABELS[name])}</LegendText>
							</LegendName>
							<LegendText>{`${formatCurrency(value)} sUSD`}</LegendText>
						</LegendRow>
					);
				})}
			</Legend>
		</TooltipWrapper>
	);
};

const Chart: FC<{data:Array<HistoricalDebtAndIssuance>}> = ({
	data
}) => {
	const { colors } = useContext(ThemeContext);
	if (!data || data.length === 0) return null;
	return (
		<ResponsiveContainer width="100%" height={270}>
			<LineChart margin={{ left: 0, top: 20, bottom: 0, right: 5 }} data={data}>
				<XAxis
					height={20}
					dataKey="timestamp"
					interval="preserveEnd"
					tick={{ fontSize: 12, fill: colors.white }}
					axisLine={false}
					tickLine={false}
					tickFormatter={tick => format(new Date(tick), 'd MMM yy')}
				/>
				<YAxis
					width={35}
					domain={['auto', 'auto']}
					tickLine={false}
					tickFormatter={tick => numbro(tick).format({ average: true })}
					tick={{ fontSize: 11, fill: colors.white }}
				/>
				<Tooltip
					cursor={{ strokeDasharray:"", stroke: colors.blue }}
					content={<CustomTooltip active={true} payload={null} label="" />}
					contentStyle={{
						backgroundColor: colors.dark,
						zIndex: 1000,
						borderColor: colors.blue,
					}}
				/>
				<Line type="monotone" dataKey="issuanceDebt" stroke="#419EF8" strokeWidth={2} dot={false} />
				<Line type="monotone" dataKey="actualDebt" stroke="#5C2AF5" strokeWidth={2} dot={false} />
				<ReferenceLine y={0} isFront={false} strokeWidth={1} stroke={colors.blue} />
			</LineChart>
		</ResponsiveContainer>
	);
};

const TooltipWrapper = styled.div`
	width: 250px;
	background-color: ${props => props.theme.colors.black};
	border: 1px solid ${props => props.theme.colors.blue};
	border-radius: 2px;
	padding: 16px;
	text-align: left;
`;

const StyledH1 = styled.div`
	font-size: 14px;
	margin-bottom: 8px;
`;

const Legend = styled.div`
	width: 100%;
`;

const LegendRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const LegendName = styled.div`
	display: flex;
	align-items: center;
`;

const LegendIcon = styled.div`
	width: 10px;
	height: 10px;
	background-color: red;
	border-radius: 50%;
	margin-right: 8px;
`;

const LegendText = styled.span`
	font-size: 12px;
	color: ${props => props.theme.colors.white};
`;
export default Chart;
