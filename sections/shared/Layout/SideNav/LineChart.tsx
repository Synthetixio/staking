import { FC, useContext } from 'react';
import { AreaChart as RechartsAreaChart, Area } from 'recharts';
import { ThemeContext } from 'styled-components';

export type LineChartData = Array<{ value: number }>;

type AreaChartProps = {
	data: LineChartData;
	trendLinePositive: boolean;
};

const AreaChart: FC<AreaChartProps> = ({ data, trendLinePositive }) => {
	const { colors } = useContext(ThemeContext);

	return (
		<RechartsAreaChart width={120} height={40} data={data}>
			<defs>
				<linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor={colors.brightGreen} stopOpacity={0.2} />
					<stop offset="45%" stopColor={colors.brightGreen} stopOpacity={0} />
				</linearGradient>
				<linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor={colors.brightPink} stopOpacity={0.2} />
					<stop offset="45%" stopColor={colors.brightPink} stopOpacity={0} />
				</linearGradient>
			</defs>
			<Area
				type="monotone"
				dataKey="value"
				stackId="1"
				stroke={trendLinePositive ? colors.brightGreen : colors.brightPink}
				fillOpacity={1}
				fill={trendLinePositive ? `url(#colorGreen)` : `url(#colorPink)`}
			/>
		</RechartsAreaChart>
	);
};

export default AreaChart;
