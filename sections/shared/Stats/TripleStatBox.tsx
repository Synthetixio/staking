import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import SNXStatBackground from 'assets/svg/snx-stat-background.svg';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_FIAT_DECIMALS } from 'constants/defaults';

interface TripleStatBoxProps {
	stakingApy?: number;
	cRatio?: number;
	stakedValue: number;
	activeDebt: any;
}

const TripleStatBox: FC<TripleStatBoxProps> = ({ stakedValue, activeDebt, stakingApy, cRatio }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	return (
		<StatsSection>
			<StatBox
				key={'staked-value'}
				style={{
					backgroundImage: `url(${SNXStatBackground})`,
				}}
			>
				<StatTitle titleColor={theme.colors.brightBlue}>
					{t('common.stat-box.staked-value')}
				</StatTitle>
				<StatValue>
					{formatFiatCurrency(stakedValue, { sign: '$', maxDecimals: DEFAULT_CRYPTO_DECIMALS })}
				</StatValue>
			</StatBox>

			{stakingApy ? (
				<StatBox
					key={'earning'}
					style={{
						backgroundImage: `url(${SNXStatBackground})`,
					}}
				>
					<StatTitle titleColor={theme.colors.brightGreen}>
						{t('common.stat-box.earning')}
					</StatTitle>
					<NeonValue>{formatPercent(stakingApy)}</NeonValue>
				</StatBox>
			) : cRatio ? (
				<StatBox
					key={'cRatio'}
					style={{
						backgroundImage: `url(${SNXStatBackground})`,
					}}
				>
					<StatTitle titleColor={theme.colors.brightGreen}>
						{t('common.stat-box.c-ratio')}
					</StatTitle>
					<NeonValue>{Math.round(100 / cRatio)}%</NeonValue>
				</StatBox>
			) : null}

			<StatBox
				key={'active-debt'}
				style={{
					backgroundImage: `url(${SNXStatBackground})`,
				}}
			>
				<StatTitle titleColor={theme.colors.brightPink}>
					{t('common.stat-box.active-debt')}
				</StatTitle>
				<StatValue>
					{formatFiatCurrency(activeDebt, { sign: '$', maxDecimals: DEFAULT_FIAT_DECIMALS })}
				</StatValue>
			</StatBox>
		</StatsSection>
	);
};

const StatsSection = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: center;
	margin: 0 auto;
`;

const StatBox = styled(FlexDivColCentered)`
	height: 200px;
	width: 400px;
	background-image: url('assets/svg/snx-stat-background.svg');
	background-position: center;
	background-repeat: no-repeat;
	justify-content: center;
	margin: 0px 20px;
`;

const StatTitle = styled.p<{ titleColor: string }>`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.titleColor};
	margin: 0;
`;

const NeonValue = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 42px;
	margin: 0;
	/* text-shadow: rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,
		rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,
		rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px; */
	text-shadow: rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,
		rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,
		rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px;
	color: #073124;
`;

const StatValue = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 34px;
	margin: 0;
`;

export default TripleStatBox;
