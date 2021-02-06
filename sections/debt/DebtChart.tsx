import React, { FC, useMemo, useContext } from 'react';
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
import { formatCurrency } from 'utils/formatters/number';

const LEGEND_LABELS = {
	actualDebt: 'debt.track.data.actualDebt',
	issuanceDebt: 'debt.track.data.issuedDebt',
};

type Payload = {
	color: string;
	name: keyof typeof LEGEND_LABELS;
	value: number;
}

type CustomTooltipProps = {
	active?: boolean;
	payload?: Payload[];
	label?: Date;
}

type ChartDatum = {
	issuanceDebt: number
	actualDebt: number
}

type ChartProp = {
	data: ChartDatum[],
	isLoaded: boolean
}


const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
	const { t } = useTranslation();
	if (!active || !label) return null;

	return (
		<TooltipWrapper>
			<Header>{format(new Date(label), 'MMM dd YYY, h:mma')}</Header>
			<Legend>
				{payload?.map(({ color, name, value }) => {
					return (
						<LegendRow key={`legend-${name}`}>
							<LegendName>
								<LegendIcon style={{ backgroundColor: color }} />
								<LegendText>{t(LEGEND_LABELS[name])}</LegendText>
							</LegendName>
							<LegendText>{`${formatCurrency('sUSD', value)}`}</LegendText>
						</LegendRow>
					);
				})}
			</Legend>
		</TooltipWrapper>
	);
};

const Chart: FC<ChartProp> = ({ data, isLoaded }) => {
	if (!data || data.length === 0 || !isLoaded) return null;
	return (
		<ResponsiveContainer width="100%" height={270}>
			<LineChart margin={{ left: 0, top: 20, bottom: 0, right: 5 }} data={data}>
				<XAxis
					height={20}
					dataKey="timestamp"
					interval="preserveEnd"
					tick={{ fontSize: 12, fontFamily: 'GT America Condensed-Bold' }}
					axisLine={false}
					tickLine={false}
					tickFormatter={tick => format(new Date(tick), 'd MMM yy')}
				/>
				<YAxis
					width={35}
					domain={[0, 'auto']}
					tickLine={false}
					tickFormatter={tick => numbro(tick).format({ average: true })}
					tick={{ fontSize: 12, fontFamily: 'GT America Condensed-Bold' }}
				/>
				<Tooltip
					content={<CustomTooltip />}
					contentStyle={{
						zIndex: 1000,
					}}
				/>
				<Line type="monotone" dataKey="issuanceDebt" stroke="#419EF8" strokeWidth={2} dot={false} />
				<Line type="monotone" dataKey="actualDebt" stroke="#5C2AF5" strokeWidth={2} dot={false} />
				<ReferenceLine y={0} isFront={false} strokeWidth={1}  />
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

const Header = styled.div`
	font-size: 14px;
	text-transform: none;
	padding-bottom: 20px;
`;

const Legend = styled.div`
	width: 100%;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
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
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
`;
export default Chart;
