import { CurrencyKey } from 'constants/currency';
import { FC } from 'react';
import { AreaChart as RechartsAreaChart, Area } from 'recharts';
import { useTheme } from 'styled-components';

export type LineChartData = Array<{ value: number }>;

type AreaChartProps = {
	data: LineChartData;
	trendLinePositive: boolean;
	currencyKey: CurrencyKey;
};

const AreaChart: FC<AreaChartProps> = ({ data, trendLinePositive, currencyKey }) => {
	const { colors } = useTheme();

	return (
		<RechartsAreaChart width={120} height={40} data={data} id={`line-price-chart-${currencyKey}`}>
			<defs>
				<linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor={colors.green} stopOpacity={0.2} />
					<stop offset="45%" stopColor={colors.green} stopOpacity={0} />
				</linearGradient>
				<linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor={colors.pink} stopOpacity={0.2} />
					<stop offset="45%" stopColor={colors.pink} stopOpacity={0} />
				</linearGradient>
			</defs>
			<Area
				type="monotone"
				dataKey="value"
				stackId="1"
				stroke={trendLinePositive ? colors.green : colors.pink}
				fillOpacity={1}
				fill={trendLinePositive ? `url(#colorGreen)` : `url(#colorRed)`}
			/>
		</RechartsAreaChart>
	);
};

export default AreaChart;
