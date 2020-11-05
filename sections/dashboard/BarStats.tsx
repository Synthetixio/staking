import { FC, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDiv, FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import ProgressBar from 'components/ProgressBar';
import Countdown from 'react-countdown';

interface BarStatsProps {
	currentCRatio: number;
	targetCRatio: number;
	claimed: boolean;
	nextFeePeriodStarts: Date;
	currentFeePeriodProgress: number;
}

const BarStats: FC<BarStatsProps> = ({
	currentCRatio,
	targetCRatio,
	claimed,
	nextFeePeriodStarts,
	currentFeePeriodProgress,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const returnCRatio = useMemo(
		() => (
			<BarStatBox key="CRATIO">
				<BarHeaderSection>
					<BarTitle>{t('dashboard.bar.c-ratio')}</BarTitle>
					<BarValue>
						{Math.round(100 / currentCRatio)}/{Math.round(100 / targetCRatio)}%
					</BarValue>
				</BarHeaderSection>
				<ShadowCRatioBar
					percentage={Math.round(100 / currentCRatio) / Math.round(100 / targetCRatio)}
					borderColor={theme.colors.brightPink}
					fillColor={theme.colors.brightBlue}
				/>
			</BarStatBox>
		),
		[currentCRatio, targetCRatio, t, theme]
	);

	return (
		<BarStatsContainer>
			{returnCRatio}
			<BarStatBox key="PERIOD">
				<BarHeaderSection>
					<BarTitle>
						{t('dashboard.bar.period.title')} &bull;{' '}
						{claimed ? (
							<Tag>{t('dashboard.bar.period.claimed')}</Tag>
						) : (
							<span> {t('dashboard.bar.period.unclaimed')}</span>
						)}
					</BarTitle>
					<BarValue>
						<Countdown date={nextFeePeriodStarts} />
					</BarValue>
				</BarHeaderSection>
				<ShadowPeriodBar
					percentage={currentFeePeriodProgress}
					borderColor={theme.colors.brightGreen}
					fillColor={theme.colors.brightGreen}
				/>
			</BarStatBox>
		</BarStatsContainer>
	);
};

const ShadowCRatioBar = styled(ProgressBar)`
	.filled-bar {
		box-shadow: 0px 0px 15px rgba(0, 209, 255, 0.6);
		transform: matrix(-1, 0, 0, 1, 0, 0);
	}
`;

const ShadowPeriodBar = styled(ProgressBar)`
	.filled-bar {
		box-shadow: 0px 0px 15px rgba(77, 244, 184, 0.25);
		transform: matrix(-1, 0, 0, 1, 0, 0);
	}
`;

const BarStatsContainer = styled(FlexDiv)`
	width: 100%;
	justify-content: space-between;
`;

const BarStatBox = styled(FlexDivCol)`
	width: 480px;
	margin-bottom: 50px;
`;

const BarHeaderSection = styled(FlexDivRowCentered)``;
const BarTitle = styled(FlexDivCentered)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.silver};

	span {
		text-transform: uppercase;
		margin-left: 4px;
	}
`;
const BarValue = styled.p`
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Tag = styled.div`
	color: ${(props) => props.theme.colors.brightGreen};
	font-size: 14px;
	margin-left: 4px;
`;

export default BarStats;
