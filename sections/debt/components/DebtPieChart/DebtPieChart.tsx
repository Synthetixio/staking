import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import PieChart from 'components/PieChart';
import { SynthsTotalSupplyData, SynthTotalSupply } from 'queries/synths/useSynthsTotalSupplyQuery';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const synthDataSortFn = (a: SynthTotalSupply, b: SynthTotalSupply) =>
	a.value.isLessThan(b.value) ? 1 : -1;

type SynthsPieChartProps = {
	data: SynthsTotalSupplyData;
};

const SynthsPieChart: FC<SynthsPieChartProps> = ({ data }) => {
	const { t } = useTranslation();
	const sortedData = Object.values(data.supplyData).sort(synthDataSortFn);

	// Get Synths with greated pool proportion than cutoff,
	// combine remaining Synths into an "Other" entry
	const cutoffIndex = sortedData.findIndex((synth) =>
		synth.poolProportion.isLessThan(MIN_PERCENT_FOR_PIE_CHART)
	);
	const topNSynths = sortedData.slice(0, cutoffIndex);
	const remaining = sortedData.slice(cutoffIndex);

	if (remaining.length) {
		const remainingSupply = { ...remaining[0] }; // deep copy
		remainingSupply.name = 'Other';
		for (const data of remaining.slice(1)) {
			remainingSupply.value = remainingSupply.value.plus(data.value);
		}
		remainingSupply.poolProportion = remainingSupply.value.div(data.totalValue);
		topNSynths.push(remainingSupply);
	}

	return (
		<SynthsPieChartContainer>
			<ChartTitle>{t('debt.actions.hedge.info.debt-pool-pie-chart.title')}</ChartTitle>
			<PieChart data={topNSynths} isShortLegend={true} />
		</SynthsPieChartContainer>
	);
};

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.navy};
	width: 100%;
	height: 680px;
`;

const ChartTitle = styled.div`
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 58px;
	padding-left: 20px;
	padding-top: 30px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => `${props.theme.fonts.extended}, ${props.theme.fonts.regular}`};
`;

export default SynthsPieChart;
