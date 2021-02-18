import { FC } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

import colors from '../../styles/theme/colors';
import { SynthTotalSupply } from 'queries/synths/useSynthsTotalSupplyQuery';
import CustomLegend from './CustomLegend';

interface BasicPieChartProps {
	data: SynthTotalSupply[];
	isShortLegend: boolean;
}

const MUTED_COLORS = [
	colors.mutedBlue,
	colors.mutedOrange,
	colors.mutedGreen,
	colors.mutedPink,
	colors.mutedYellow,
	colors.mutedPurple,
	colors.mutedGray,
	colors.mutedRed,
	colors.mutedFoamGreen,
	colors.mutedBurntOrange,
	colors.mutedForestGreen,
];
export const BRIGHT_COLORS = [
	colors.blue,
	colors.orange,
	colors.green,
	colors.pink,
	colors.yellow,
	colors.purple,
	colors.gray,
	colors.red,
	colors.foamGreen,
	colors.burntOrange,
	colors.forestGreen,
];

const BasicPieChart: FC<BasicPieChartProps> = ({ data, isShortLegend }) => {
	const formattedData = data
		.sort((a, b) => (a.value.isLessThan(b.value) ? 1 : -1))
		.map((supply) => ({
			...supply,
			formattedValue: supply.value.toNumber(),
		}));

	return (
		<ResponsiveContainer width="100%" height={isShortLegend ? '75%' : '100%'}>
			<PieChart height={380}>
				<Pie
					data={formattedData}
					cx="50%"
					cy="50%"
					labelLine={false}
					outerRadius={140}
					fill={colors.mutedGreen}
					dataKey="formattedValue"
					strokeWidth={1.5}
				>
					{formattedData.map((entry: SynthTotalSupply, index: number) => (
						<Cell
							key={`cell-${index}`}
							fill={MUTED_COLORS[index % MUTED_COLORS.length]}
							stroke={BRIGHT_COLORS[index % BRIGHT_COLORS.length]}
						/>
					))}
				</Pie>
				<Legend content={<CustomLegend isShortLegend={isShortLegend} />} />
			</PieChart>
		</ResponsiveContainer>
	);
};

export default BasicPieChart;
