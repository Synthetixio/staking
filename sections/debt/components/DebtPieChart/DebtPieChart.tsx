import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import PieChart from 'components/PieChart';
import DebtPoolTable from '../DebtPoolTable';
import { SynthsTotalSupplyData } from '@synthetixio/queries';
import { createPieData } from './pie-data';
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

const DebtPieChart: FC<DebtPieChartProps> = () => {
	const [data, setData] = useState<any>([]);
	useEffect(() => {
		fetch('https://synthetix-staking-dispersed.s3.amazonaws.com/debt-data/data.json')
			.then((x) => x.json())
			.then(createPieData)
			.then((x) => x.filter((x) => x.name !== 'total_excluding_sUSD').sort(synthDataSortFn))
			.then((x) => setData(x));
	}, []);
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
			<PieChart data={data} dataKey={'skewValueChart'} tooltipFormatter={Tooltip} />
			<TableWrapper>
				<DebtPoolTable synths={data} isLoading={data.length === 0} isLoaded={data.length > 0} />
			</TableWrapper>
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

export default DebtPieChart;
