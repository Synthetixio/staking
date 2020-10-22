import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import SNXStatBackground from 'assets/svg/snx-stat-background.svg';
import { formatCryptoCurrency, formatFiatCurrency } from 'utils/formatters/number';
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_FIAT_DECIMALS } from 'constants/defaults';

interface StatBoxesProps {
	stakedValue: number;
	activeDebt: any;
}

const StatBoxes: FC<StatBoxesProps> = ({ stakedValue, activeDebt }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	return (
		<StatsSection>
			{/* @TODO Refactor to StatBox.tsx */}
			<StatBox
				key={'staked-value'}
				style={{
					backgroundImage: `url(${SNXStatBackground})`,
				}}
			>
				<StatTitle titleColor={theme.colors.brightBlue}>
					{t('dashboard.stat-box.staked-value')}
				</StatTitle>
				<StatValue>
					{formatCryptoCurrency(stakedValue, { maxDecimals: DEFAULT_CRYPTO_DECIMALS })}
				</StatValue>
			</StatBox>

			<StatBox
				key={'earning'}
				style={{
					backgroundImage: `url(${SNXStatBackground})`,
				}}
			>
				<StatTitle titleColor={theme.colors.brightGreen}>
					{t('dashboard.stat-box.earning')}
				</StatTitle>
				{/* <StatValue>{formatPercent(stakingApy / 100)}</StatValue> */}
			</StatBox>

			<StatBox
				key={'active-debt'}
				style={{
					backgroundImage: `url(${SNXStatBackground})`,
				}}
			>
				<StatTitle titleColor={theme.colors.brightPink}>
					{t('dashboard.stat-box.active-debt')}
				</StatTitle>
				<StatValue>
					{formatFiatCurrency(activeDebt, { maxDecimals: DEFAULT_FIAT_DECIMALS })}
				</StatValue>
			</StatBox>
		</StatsSection>
	);
};

const StatsSection = styled(FlexDivRowCentered)`
	justify-content: space-around;
	width: 80%;
	margin: 0 auto;
`;

const StatBox = styled(FlexDivColCentered)`
	height: 200px;
	width: 200px;
	background-image: url('assets/svg/snx-stat-background.svg');
	background-position: center;
	background-repeat: no-repeat;
	justify-content: center;
`;

const StatTitle = styled.p<{ titleColor: string }>`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.titleColor};
	margin: 0;
`;

const StatValue = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 28px;
	margin: 0;
`;

export default StatBoxes;
