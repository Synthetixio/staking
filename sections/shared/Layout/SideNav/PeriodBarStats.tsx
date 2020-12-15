import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Countdown from 'react-countdown';

import ProgressBar from 'components/ProgressBar';

import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import { BarStatBox, BarHeaderSection, BarTitle, BarValue } from './common';

const PeriodBarStats: FC = () => {
	const { t } = useTranslation();
	const { nextFeePeriodStarts, currentFeePeriodProgress } = useFeePeriodTimeAndProgress();

	return (
		<BarStatBox>
			<BarHeaderSection>
				<BarTitle>{t('sidenav.bars.period.title')}</BarTitle>
				<BarValue>
					<Countdown autoStart={true} date={nextFeePeriodStarts.getTime()} />
				</BarValue>
			</BarHeaderSection>
			<ProgressBar percentage={currentFeePeriodProgress} variant="green" />
		</BarStatBox>
	);
};

export default PeriodBarStats;
