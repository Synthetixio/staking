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
					<BarValue>{currentCRatio / 100}%</BarValue>
				</BarHeaderSection>
				<ProgressBar
					percentage={currentCRatio / targetCRatio}
					borderColor={theme.colors.brightPink}
					fillColor={theme.colors.brightBlue}
					glowColor={`0px 0px 15px rgba(77, 244, 184, 0.25);`} // TODO add the glow to colors
				/>
			</BarStatBox>
		),
		[currentCRatio, targetCRatio]
	);

	return (
		<BarStatsContainer>
			{returnCRatio}
			<BarStatBox key="PERIOD">
				<BarHeaderSection>
					<BarTitle>
						{t('dashboard.bar.period.title')} &bull;{' '}
						{claimed && <Tag>{t('dashboard.bar.period.tag')}</Tag>}
					</BarTitle>
					<BarValue>
						<Countdown date={nextFeePeriodStarts} />
					</BarValue>
				</BarHeaderSection>
				<ProgressBar
					percentage={currentFeePeriodProgress}
					borderColor={theme.colors.brightGreen}
					fillColor={theme.colors.brightGreen}
					glowColor={`0px 0px 15px rgba(77, 244, 184, 0.25);`}
				/>
			</BarStatBox>
		</BarStatsContainer>
	);
};

const BarStatsContainer = styled(FlexDiv)``;

const BarStatBox = styled(FlexDivCol)`
	margin-right: 16px;
	width: 400px;
`;

const BarHeaderSection = styled(FlexDivRowCentered)`
	justify-content: space-between;
`;
const BarTitle = styled(FlexDivCentered)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.silver};
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
