import { FC, useMemo } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import PieChart from 'components/PieChart';
import DebtPoolTable from '../DebtPoolTable';
import colors from 'styles/theme/colors';
import useSynthetixQueries from '@synthetixio/queries';
import { formatCurrency } from 'utils/formatters/number';
import { SynthsTotalSupplyData, SynthTotalSupply } from '@synthetixio/queries';

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
	a.poolProportion.lt(b.poolProportion) ? 1 : -1;

type DebtPieChartProps = {
	data: SynthsTotalSupplyData;
};

const SynthsPieChart: FC<DebtPieChartProps> = () => {
	const { useSynthsTotalSupplyQuery } = useSynthetixQueries();

	const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
	const totalSupply = synthsTotalSupplyQuery.isSuccess ? synthsTotalSupplyQuery.data : undefined;

	const pieData = useMemo(() => {
		const supplyData = totalSupply?.supplyData ?? [];
		const sortedData = Object.values(supplyData).sort(synthDataSortFn);

		const cutoffIndex = sortedData.findIndex((synth) =>
			synth.poolProportion.lt(MIN_PERCENT_FOR_PIE_CHART)
		);

		const topSynths = sortedData.slice(0, cutoffIndex);
		const remaining = sortedData.slice(cutoffIndex);

		if (remaining.length) {
			const remainingSupply = { ...remaining[0] };
			remainingSupply.name = 'Other';
			for (const data of remaining.slice(1)) {
				remainingSupply.value = remainingSupply.value.add(data.value);
				remainingSupply.poolProportion = remainingSupply.poolProportion.add(data.poolProportion);
				remainingSupply.skewValue = remainingSupply.skewValue.add(data.skewValue);
				remainingSupply.totalSupply = remainingSupply.totalSupply.add(data.totalSupply);
			}
			topSynths.push(remainingSupply);
		}
		return topSynths.sort(synthDataSortFn).map((supply, index) => ({
			name: supply.name,
			totalSupply: supply.totalSupply.toNumber(),
			poolProportion: supply.poolProportion.toNumber(),
			value: supply.value.toNumber(),
			fillColor: MUTED_COLORS[index % MUTED_COLORS.length],
			strokeColor: BRIGHT_COLORS[index % BRIGHT_COLORS.length],
			skewValue: supply.skewValue,
			skewValueChart: Math.abs(supply.skewValue.toNumber()),
		}));
	}, [totalSupply?.supplyData]);

	return (
		<SynthsPieChartContainer>
			<PieChart data={pieData} dataKey={'skewValueChart'} tooltipFormatter={Tooltip} />
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

const Tooltip: FC<{ name: string; value: number; payload: { skewValue: Wei } }> = ({
	name,
	payload,
}) => {
	return (
		<StyledTooltip isNeg={payload.skewValue.lt(0)}>
			{name}: {formatCurrency(name, payload.skewValue, { sign: '$' })}
		</StyledTooltip>
	);
};

const TableWrapper = styled.div`
	border-top: 1px solid ${(props) => props.theme.colors.grayBlue};
`;

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.navy};
	width: 100%;
`;

const StyledTooltip = styled.div<{ isNeg: boolean }>`
	color: ${(props) => (props.isNeg ? props.theme.colors.red : props.theme.colors.white)};
`;

export default SynthsPieChart;
