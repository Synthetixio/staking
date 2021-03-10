import { FC, useMemo } from 'react';
import styled from 'styled-components';

import { SynthTotalSupply, SynthsTotalSupplyData } from 'queries/synths/useSynthsTotalSupplyQuery';
import useSynthsTotalSupplyQuery from 'queries/synths/useSynthsTotalSupplyQuery';

import PieChart from 'components/PieChart';
import DebtPoolTable from '../DebtPoolTable';
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

type DebtPieChartProps = {
	data: SynthsTotalSupplyData;
};

const SynthsPieChart: FC<DebtPieChartProps> = () => {
	const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
	const totalSupply = synthsTotalSupplyQuery.isSuccess ? synthsTotalSupplyQuery.data : undefined;

	const pieData = useMemo(() => {
		const supplyData = totalSupply?.supplyData ?? [];
		const sortedData = Object.values(supplyData).sort(synthDataSortFn);

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
			remainingSupply.poolProportion = remainingSupply.value.div(totalSupply?.totalValue ?? 0);
			topNSynths.push(remainingSupply);
		}
		return topNSynths
			.sort((a, b) => (a.value.isLessThan(b.value) ? 1 : -1))
			.map((supply, index) => ({
				...supply,
				value: supply.value.toNumber(),
				fillColor: MUTED_COLORS[index % MUTED_COLORS.length],
				strokeColor: BRIGHT_COLORS[index % BRIGHT_COLORS.length],
			}));
	}, [totalSupply?.supplyData, totalSupply?.totalValue]);

	return (
		<SynthsPieChartContainer>
			<PieChart data={pieData} dataKey={'value'} />
			<TableWrapper>
				<DebtPoolTable
					synths={pieData}
					isLoading={synthsTotalSupplyQuery.isLoading}
					isLoaded={synthsTotalSupplyQuery.isSuccess}
				/>
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
