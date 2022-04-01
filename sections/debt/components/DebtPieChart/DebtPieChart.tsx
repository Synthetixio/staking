import { FC, useMemo } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import PieChart from 'components/PieChart';
import DebtPoolTable from '../DebtPoolTable';
import colors from 'styles/theme/colors';
import { formatCurrency } from 'utils/formatters/number';
import { SynthsTotalSupplyData, SynthTotalSupply } from '@synthetixio/queries';
import { ExternalLink } from 'styles/common';

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

	const pieData = [
		{
			name: 'sAAVE', // sETH
			totalSupply: 1373.52, // totalSupply,
			poolProportion: 0.0004, // for 20% do 0.20
			value: 209.5, // price in USD
			fillColor: MUTED_COLORS[0 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[0 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 288598, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(288598), //  same number as above
		},
		{
			name: 'sADA', // sETH
			totalSupply: 169698.76, // totalSupply,
			poolProportion: 0.0003, // for 20% do 0.20
			value: 1.162, // price in USD
			fillColor: MUTED_COLORS[1 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[1 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 197189, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(197189), // same number as above
		},
		{
			name: 'sAUD', // sETH
			totalSupply: 13846089.64, // totalSupply,
			poolProportion: 0.0148, // for 20% do 0.20
			value: 0.74, // price in USD
			fillColor: MUTED_COLORS[2 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[2 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 10360696, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(10360696), // same number as above
		},
		{
			name: 'sAVAX', // sETH
			totalSupply: 612.3, // totalSupply,
			poolProportion: 0.0001, // for 20% do 0.20
			value: 95.85, // price in USD
			fillColor: MUTED_COLORS[3 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[3 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 58689, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(58689), // same number as above
		},
		{
			name: 'sBTC', // sETH
			totalSupply: 3973.67, // totalSupply,
			poolProportion: 0.2606, // for 20% do 0.20
			value: 45784.41, // price in USD
			fillColor: MUTED_COLORS[4 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[4 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 179516034.20787862, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(179516034.20787862), // same number as above
		},
		{
			name: 'sCHF', // sETH
			totalSupply: 15954585.07, // totalSupply,
			poolProportion: 0.0247, // for 20% do 0.20
			value: 2.47, // price in USD
			fillColor: MUTED_COLORS[5 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[5 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 17288196.93, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(17288196.93), // same number as above
		},
		{
			name: 'sDEFI', // sETH
			totalSupply: 166.61, // totalSupply,
			poolProportion: 0.0052, // for 20% do 0.20
			value: 1.08, // price in USD
			fillColor: MUTED_COLORS[6 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[6 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 3613778.88, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(3613778.88), // same number as above
		},
		{
			name: 'sDOT', // sETH
			totalSupply: 29728.03, // totalSupply,
			poolProportion: 0.0009, // for 20% do 0.20
			value: 21.6, // price in USD
			fillColor: MUTED_COLORS[7 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[7 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 642397.34, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(642397.34), // same number as above
		},
		{
			name: 'sETH', // sETH
			totalSupply: 2938033.03, // totalSupply,
			poolProportion: 0.3331, // for 20% do 0.20
			value: 3294.5, // price in USD
			fillColor: MUTED_COLORS[8 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[8 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: -232984022.15, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(-232984022.15), // same number as above
		},
		{
			name: 'sEUR', // sETH
			totalSupply: 36211809.09, // totalSupply,
			poolProportion: 0.0573, // for 20% do 0.20
			value: 1.1, // price in USD
			fillColor: MUTED_COLORS[9 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[9 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 40105296.454930626, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(40105296.454930626), // same number as above
		},
		{
			name: 'sGBP', // sETH
			totalSupply: 7480473.88301782, // totalSupply,
			poolProportion: 0.014, // for 20% do 0.20
			value: 1.31, // price in USD
			fillColor: MUTED_COLORS[9 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[9 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 9835177.45191417, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(9835177.45191417), // same number as above
		},
		{
			name: 'sJPY', // sETH
			totalSupply: 1466915973.4299848, // totalSupply,
			poolProportion: 0.0172, // for 20% do 0.20
			value: 0.008, // price in USD
			fillColor: MUTED_COLORS[10 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[10 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 12062552.733632905, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(12062552.733632905), // same number as above
		},
		{
			name: 'sKRW', // sETH
			totalSupply: 15093224512.4567, // totalSupply,
			poolProportion: 0.0177, // for 20% do 0.20
			value: 0.008, // price in USD
			fillColor: MUTED_COLORS[11 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[11 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 12422931.231712861, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(12422931.231712861), // same number as above
		},
		{
			name: 'sLINK', // sETH
			totalSupply: 416162.58128027443, // totalSupply,
			poolProportion: 0.0099, // for 20% do 0.20
			value: 17.06, // price in USD
			fillColor: MUTED_COLORS[12 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[12 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 6942215.037894553, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(6942215.037894553), // same number as above
		},
		{
			name: 'sMATIC', // sETH
			totalSupply: 1888.664685248167, // totalSupply,
			poolProportion: 0.0, // for 20% do 0.20
			value: 1.62, // price in USD
			fillColor: MUTED_COLORS[13 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[13 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 2911.5644218754637, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(2911.5644218754637), // same number as above
		},
		{
			name: 'sSOL', // sETH
			totalSupply: 817.8003065393315, // totalSupply,
			poolProportion: 0.0001, // for 20% do 0.20
			value: 124.65, // price in USD
			fillColor: MUTED_COLORS[14 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[14 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 58594.93677615221, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(58594.93677615221), // same number as above
		},
		{
			name: 'sUNI', // sETH
			totalSupply: 359.82849025226614, // totalSupply,
			poolProportion: 0.0, // for 20% do 0.20
			value: 11.32, // price in USD
			fillColor: MUTED_COLORS[15 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[15 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 4073.2585096556527, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(4073.2585096556527), // same number as above
		},
		{
			name: 'sUSD', // sETH
			totalSupply: 223467566.1172528, // totalSupply,
			poolProportion: 0.2436, // for 20% do 0.20
			value: 1.0, // price in USD
			fillColor: MUTED_COLORS[16 % MUTED_COLORS.length], // increment the 0 with every entry by 1
			strokeColor: BRIGHT_COLORS[16 % BRIGHT_COLORS.length], // increment the 0 with every entry by 1
			skewValue: 170528382.4040016, // tokenSupply * USD rate | debt_in_usd in spreadsheet
			skewValueChart: Math.abs(170528382.4040016), // same number as above
		},
	].sort(synthDataSortFn);
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
			<PieChart data={pieData} dataKey={'skewValueChart'} tooltipFormatter={Tooltip} />
			<TableWrapper>
				<DebtPoolTable synths={pieData} isLoading={isLoading} isLoaded={isLoaded} />
			</TableWrapper>
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
