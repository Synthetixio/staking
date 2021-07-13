import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import { formatFiatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';

import Main from 'sections/wrap';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { isWalletConnectedState } from 'store/wallet';

import StatBox from 'components/StatBox';
import ProgressBar from 'components/ProgressBar';

const WrapPage = () => {
	const { t } = useTranslation();
	const {
		stakedCollateralValue,
		percentageCurrentCRatio,
		debtBalance,
		percentCurrentCRatioOfTarget,
	} = useStakingCalculations();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<StatsSection>
				<StakedValue
					title={t('common.stat-box.staked-value')}
					value={formatFiatCurrency(
						getPriceAtCurrentRate(
							stakedCollateralValue.isNaN() ? toBigNumber(0) : stakedCollateralValue
						),
						{
							sign: selectedPriceCurrency.sign,
						}
					)}
				/>
				<CRatio
					title={t('common.stat-box.c-ratio')}
					value={isWalletConnected ? formatPercent(percentageCurrentCRatio) : '-%'}
					size="lg"
				>
					<CRatioProgressBar
						variant="blue-pink"
						percentage={
							percentCurrentCRatioOfTarget.isNaN() ? 0 : percentCurrentCRatioOfTarget.toNumber()
						}
					/>
				</CRatio>
				<ActiveDebt
					title={t('common.stat-box.active-debt')}
					value={formatFiatCurrency(
						getPriceAtCurrentRate(debtBalance.isNaN() ? toBigNumber(0) : debtBalance),
						{
							sign: selectedPriceCurrency.sign,
						}
					)}
					isPink
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const CRatio = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

export const CRatioProgressBar = styled(ProgressBar)`
	height: 6px;
	width: 100%;
	transform: translateY(12px);
	// match StatBox "lg" background size width
	max-width: 176px;
`;

export default WrapPage;
