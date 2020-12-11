import { FC, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import ProgressBar from 'components/ProgressBar';
import Countdown from 'react-countdown';
import { formatPercent, toBigNumber } from 'utils/formatters/number';
import BigNumber from 'bignumber.js';

type PeriodBarStatsProps = {
	nextFeePeriodStarts: Date;
	currentFeePeriodProgress: number;
};

export const PeriodBarStats: FC<PeriodBarStatsProps> = ({
	nextFeePeriodStarts,
	currentFeePeriodProgress,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();

	return (
		<BarStatBox key="PERIOD">
			<BarHeaderSection>
				<BarTitle>{t('sidenav.bars.period.title')}</BarTitle>
				<BarValue>
					<Countdown date={nextFeePeriodStarts} />
				</BarValue>
			</BarHeaderSection>
			<ShadowPeriodBar
				percentage={currentFeePeriodProgress}
				borderColor={theme.colors.green}
				fillColor={theme.colors.green}
			/>
		</BarStatBox>
	);
};

type CRatioBarStatsProps = {
	currentCRatio: BigNumber;
	targetCRatio: BigNumber;
};

export const CRatioBarStats: FC<CRatioBarStatsProps> = ({ currentCRatio, targetCRatio }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const barPercentage = useMemo(
		() =>
			currentCRatio
				? Math.round(toBigNumber(100).dividedBy(currentCRatio).toNumber()) /
				  Math.round(toBigNumber(100).dividedBy(targetCRatio).toNumber())
				: 0,
		[currentCRatio, targetCRatio]
	);

	return (
		<BarStatBox key="CRATIO">
			<BarHeaderSection>
				<BarTitle>{t('sidenav.bars.c-ratio')}</BarTitle>
				<BarValue>
					{formatPercent(currentCRatio ? toBigNumber(1).dividedBy(currentCRatio) : 0)}
				</BarValue>
			</BarHeaderSection>
			<ShadowCRatioBar
				percentage={barPercentage}
				borderColor={theme.colors.pink}
				fillColor={theme.colors.blue}
			/>
		</BarStatBox>
	);
};

const ShadowCRatioBar = styled(ProgressBar)`
	.filled-bar {
		box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.6);
	}
`;

const ShadowPeriodBar = styled(ProgressBar)`
	.filled-bar {
		box-shadow: 0px 0px 10px rgba(77, 244, 184, 0.25);
	}
`;

const BarStatBox = styled(FlexDivCol)`
	width: 100%;
	margin-top: 25px;
	margin-bottom: 35px;
	&:last-child {
		margin-bottom: 45px;
		margin-top: 0;
	}
`;

const BarHeaderSection = styled(FlexDivRowCentered)``;
const BarTitle = styled(FlexDivCentered)`
	font-size: 10px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.gray};
`;
const BarValue = styled.p`
	font-size: 10px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;
