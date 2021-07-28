import { FC } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type PieChartData = {
	value: number;
};

type BasicPieChartProps = {
	data: PieChartData[];
	dataKey: string;
	tooltipFormatter?: FC<{ name: string; value: number; payload: any }>; // probably anti-pattern...
};

const BasicPieChart: FC<BasicPieChartProps> = ({ data, dataKey, tooltipFormatter }) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart height={100}>
				<Pie data={data} cx="50%" cy="50%" labelLine={false} dataKey={dataKey} strokeWidth={1.5}>
					{data.map((entry: any, index: number) => (
						<Cell key={`cell-${index}`} fill={entry.fillColor} stroke={entry.strokeColor} />
					))}
				</Pie>
				{!tooltipFormatter ? null : (
					<Tooltip
						content={
							// @ts-ignore
							<CustomTooltip formatter={tooltipFormatter} />
						}
					/>
				)}
			</PieChart>
		</ResponsiveContainer>
	);
};

const CustomTooltip: FC<{
	active: boolean;
	payload: [
		{
			name: string;
			value: number;
			payload: any;
		}
	];
	formatter: FC<{ name: string; value: number; payload: any }>;
}> = ({ active, payload, formatter }) => {
	if (!(active && payload?.length)) return null;
	const [item] = payload;
	return (
		<TooltipContentStyle>
			{formatter({ name: item.name, value: item.value, payload: item.payload })}
		</TooltipContentStyle>
	);
};

const TooltipContentStyle = styled.div`
	background: ${(props) => props.theme.colors.grayBlue};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	padding: 10px 15px;
	border-radius: 5px;
`;

export default BasicPieChart;
