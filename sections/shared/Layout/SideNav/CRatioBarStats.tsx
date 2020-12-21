import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ProgressBar from 'components/ProgressBar';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { formatPercent, toBigNumber } from 'utils/formatters/number';

import { BarStatBox, BarHeaderSection, BarTitle, BarValue } from './common';
import { FlexDivRow } from 'styles/common';

const CRatioBarStats: FC = () => {
	const { t } = useTranslation();

	const { currentCRatio, targetCRatio } = useStakingCalculations();

	const barPercentage = useMemo(
		() =>
			currentCRatio.gt(0)
				? Math.round(toBigNumber(100).dividedBy(currentCRatio).toNumber()) /
				  Math.round(toBigNumber(100).dividedBy(targetCRatio).toNumber())
				: 0,
		[currentCRatio, targetCRatio]
	);

	return (
		<BarStatBox>
			<BarHeaderSection>
				<BarTitle>{t('sidenav.bars.c-ratio')}</BarTitle>
				<BarValue>
					{formatPercent(currentCRatio.gt(0) ? toBigNumber(1).dividedBy(currentCRatio) : 0)}
				</BarValue>
			</BarHeaderSection>
			<ProgressBar percentage={barPercentage} variant="blue-pink" />
			<Row>
				<BarTitle>{t('sidenav.bars.t-ratio')}</BarTitle>
				<CustomValue>
					{formatPercent(targetCRatio.gt(0) ? toBigNumber(1).dividedBy(targetCRatio) : 0)}
				</CustomValue>
			</Row>
		</BarStatBox>
	);
};

const Row = styled(FlexDivRow)`
	justify-content: space-between;
	margin-top: 4px;
`;

const CustomValue = styled(BarValue)`
	color: ${(props) => props.theme.colors.gray};
`;

export default CRatioBarStats;
