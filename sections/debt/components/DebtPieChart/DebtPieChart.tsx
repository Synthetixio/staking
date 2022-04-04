import { FC } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import PieChart from 'components/PieChart';
import DebtPoolTable from '../DebtPoolTable';
import { SynthsTotalSupplyData } from '@synthetixio/queries';
import { ExternalLink } from 'styles/common';
import { pieData } from './state';
import { formatCurrency } from 'utils/formatters/number';

// const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const synthDataSortFn = (a: any, b: any) => {
	if (typeof a.poolProportion === 'number') return a.poolProportion < b.poolProportion ? 1 : -1;
	return a.poolProportion.lt(b.poolProportion) ? 1 : -1;
};

type DebtPieChartProps = {
	data?: SynthsTotalSupplyData;
	isLoading: boolean;
	isLoaded: boolean;
};

const SynthsPieChart: FC<DebtPieChartProps> = ({ data, isLoaded, isLoading }) => {
	//	const totalSupply = data ? data : undefined;
	/* useMemo(() => { 
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
		} 	return  topSynths.sort(synthDataSortFn).map((supply, index) => ({
			name: supply.name,
			totalSupply: supply.totalSupply.toNumber(),
			poolProportion: supply.poolProportion.toNumber(),
			value: supply.value.toNumber(),
			fillColor: MUTED_COLORS[index % MUTED_COLORS.length],
			strokeColor: BRIGHT_COLORS[index % BRIGHT_COLORS.length],
			skewValue: supply.skewValue,
			skewValueChart: Math.abs(supply.skewValue.toNumber()),
		}))
	 	return  
	 	}, []); */

	return (
		<SynthsPieChartContainer>
			<PieChart
				data={pieData.sort(synthDataSortFn)}
				dataKey={'skewValueChart'}
				tooltipFormatter={Tooltip}
			/>
			<TableWrapper>
				<DebtPoolTable
					synths={pieData.sort(synthDataSortFn)}
					isLoading={isLoading}
					isLoaded={isLoaded}
				/>
			</TableWrapper>
			<StyledLink>Last updated Friday, 1st of April 2022</StyledLink>
			<StyledLink>
				For more up to date data click{' '}
				<ExternalLink href="https://www.dropbox.com/s/wuyt3qsm55hn7eo/data.csv?dl=0">
					here
				</ExternalLink>
			</StyledLink>
		</SynthsPieChartContainer>
	);
};

const Tooltip: FC<{ name: string; value: number; payload: { skewValue: Wei } }> = ({
	name,
	payload,
}) => {
	return (
		<StyledTooltip
			isNeg={
				typeof payload.skewValue !== 'number' ? payload.skewValue.lt(0) : payload.skewValue < 0
			}
		>
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

const StyledLink = styled.div`
	text-align: center;
`;

export default SynthsPieChart;
