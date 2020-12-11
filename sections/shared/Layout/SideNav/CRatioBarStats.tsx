import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProgressBar from 'components/ProgressBar';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { formatPercent, toBigNumber } from 'utils/formatters/number';

import { BarStatBox, BarHeaderSection, BarTitle, BarValue } from './common';

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
		</BarStatBox>
	);
};

export default CRatioBarStats;
