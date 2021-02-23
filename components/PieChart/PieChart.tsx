import { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type PieChartData = {
	value: number;
};

type BasicPieChartProps = {
	data: PieChartData[];
	dataKey: string;
};

const BasicPieChart: FC<BasicPieChartProps> = ({ data, dataKey }) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart height={100}>
				<Pie data={data} cx="50%" cy="50%" labelLine={false} dataKey={dataKey} strokeWidth={1.5}>
					{data.map((entry: any, index: number) => (
						<Cell key={`cell-${index}`} fill={entry.fillColor} stroke={entry.strokeColor} />
					))}
				</Pie>
			</PieChart>
		</ResponsiveContainer>
	);
};

export default BasicPieChart;
