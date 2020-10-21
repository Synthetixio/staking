import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDiv, FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import ProgressBar from 'components/ProgressBar';

interface BarStatsProps {
	currentCRatio: any;
	targetCRatio: any;
	claimed: any;
	hoursLeftInPeriod: any;
}

const BarStats: FC<BarStatsProps> = ({
	currentCRatio,
	targetCRatio,
	claimed,
	hoursLeftInPeriod,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	return (
		<BarStatsContainer>
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
			<BarStatBox key="PERIOD">
				<BarHeaderSection>
					<BarTitle>
						{t('dashboard.bar.period.title')} &bull;{' '}
						{claimed && <Tag>{t('dashboard.bar.period.tag')}</Tag>}
					</BarTitle>
					<BarValue>{hoursLeftInPeriod}</BarValue>
				</BarHeaderSection>
				<ProgressBar
					percentage={0.8}
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
