import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
import { PossibleActions } from 'sections/dashboard';

import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import StatBox from 'components/StatBox';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

const DashboardPage = () => {
	const { t } = useTranslation();

	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX, CRYPTO_CURRENCY_MAP.ETH]);
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(
		CRYPTO_CURRENCY_MAP.sUSD
	);
	const exchangeRates = useExchangeRatesQuery();
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const currentCRatio = debtDataQuery.data?.currentCRatio ?? 0;
	const targetCRatio = debtDataQuery.data?.targetCRatio ?? 0;

	// TODO: replace with useMemo
	// eslint-disable-next-line
	const activeDebt = debtDataQuery.data?.debtBalance ?? 0;
	const collateral = debtDataQuery.data?.collateral ?? 0;
	const sUSDRate = exchangeRates.data?.sUSD ?? 0;
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;

	// TODO: replace with selected currency instead of usd hardcode
	// eslint-disable-next-line
	const SNXRate = currencyRates.data?.SNX ?? 0;
	const stakedValue = collateral * Math.min(1, currentCRatio / targetCRatio) * SNXRate;

	// TODO: replace with useMemo
	const weeklyRewards = sUSDRate * feesToDistribute + SNXRate * rewardsToDistribute;
	const stakingAPR = (weeklyRewards * (activeDebt / totalsUSDDebt) * 52) / stakedValue;

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<StakedValue
						title={t('common.stat-box.staked-value')}
						value={formatFiatCurrency(stakedValue ? stakedValue : 0, { sign: '$' })}
					/>
					<APY
						title={t('common.stat-box.earning')}
						value={formatPercent(stakingAPR ? stakingAPR : 0)}
						size="lg"
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(activeDebt ? activeDebt : 0, { sign: '$' })}
					/>
				</StatsSection>
				<LineSpacer />
				<PossibleActions />
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

const StakedValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightBlue};
	}
`;

const APY = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightGreen};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.brightGreenTextShadow};
		color: #073124;
	}
`;

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightPink};
	}
`;

export default DashboardPage;
