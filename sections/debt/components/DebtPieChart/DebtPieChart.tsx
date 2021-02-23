import { FC } from 'react';
import styled from 'styled-components';

import { SynthsTotalSupplyData, SynthTotalSupply } from 'queries/synths/useSynthsTotalSupplyQuery';

import PieChart from 'components/PieChart';
import SynthsTable from '../SynthsTable';
import colors from 'styles/theme/colors';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

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
const BRIGHT_COLORS = [
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

const synthDataSortFn = (a: SynthTotalSupply, b: SynthTotalSupply) =>
	a.value.isLessThan(b.value) ? 1 : -1;

type SynthsPieChartProps = {
	data: SynthsTotalSupplyData;
};

const SynthsPieChart: FC<SynthsPieChartProps> = ({ data }) => {
	if (!data) return null;
	const sortedData = Object.values(data.supplyData).sort(synthDataSortFn);

	const cutoffIndex = sortedData.findIndex((synth) =>
		synth.poolProportion.isLessThan(MIN_PERCENT_FOR_PIE_CHART)
	);

	const topNSynths = sortedData.slice(0, cutoffIndex);
	const remaining = sortedData.slice(cutoffIndex);

	if (remaining.length) {
		const remainingSupply = { ...remaining[0] };
		remainingSupply.name = 'Other';
		for (const data of remaining.slice(1)) {
			remainingSupply.value = remainingSupply.value.plus(data.value);
		}
		remainingSupply.poolProportion = remainingSupply.value.div(data.totalValue);
		topNSynths.push(remainingSupply);
	}

	const pieData = topNSynths
		.sort((a, b) => (a.value.isLessThan(b.value) ? 1 : -1))
		.map((supply, index) => ({
			...supply,
			value: supply.value.toNumber(),
			fillColor: MUTED_COLORS[index % MUTED_COLORS.length],
			strokeColor: BRIGHT_COLORS[index % BRIGHT_COLORS.length],
		}));

	return (
		<SynthsPieChartContainer>
			<PieChart data={pieData} dataKey={'value'} />
			<TableWrapper>
				<SynthsTable synths={pieData} />
			</TableWrapper>
		</SynthsPieChartContainer>
	);
};

const TableWrapper = styled.div`
	border-top: 1px solid ${(props) => props.theme.colors.grayBlue};
`;

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.navy};
	width: 100%;
`;

export default SynthsPieChart;
