import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Countdown, { zeroPad } from 'react-countdown';

import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import { BarStatBox, BarHeaderSection, BarTitle, BarValue, StyledProgressBar } from './common';

const PeriodBarStats: FC = () => {
	const { t } = useTranslation();
	const { nextFeePeriodStarts, currentFeePeriodProgress } = useFeePeriodTimeAndProgress();

	const nextFeePeriodStartsTime = nextFeePeriodStarts.getTime();

	return (
		<BarStatBox>
			<BarHeaderSection>
				<BarTitle>{t('sidenav.bars.period.title')}</BarTitle>
				<BarValue>
					{nextFeePeriodStartsTime > 0 && (
						<Countdown
							autoStart={true}
							date={nextFeePeriodStartsTime}
							renderer={({ days, hours, minutes }) => (
								<span>
									{zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}
								</span>
							)}
						/>
					)}
				</BarValue>
			</BarHeaderSection>
			<StyledProgressBar percentage={currentFeePeriodProgress} variant="green" />
		</BarStatBox>
	);
};

export default PeriodBarStats;
