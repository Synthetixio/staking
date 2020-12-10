import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
import { PossibleActions } from 'sections/dashboard';

import StatBox from 'components/StatBox';

import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

const DashboardPage = () => {
	const { t } = useTranslation();

	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(
		CRYPTO_CURRENCY_MAP.sUSD
	);
	const exchangeRates = useExchangeRatesQuery();
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const { currentCRatio, targetCRatio, debtBalance, collateral } = useStakingCalculations();

	const sUSDRate = exchangeRates.data?.sUSD ?? 0;
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;

	// TODO: replace with selected currency instead of usd hardcode
	// eslint-disable-next-line
	const SNXRate = exchangeRates.data?.SNX ?? 0;
	const stakedValue = collateral
		.multipliedBy(Math.min(1 / currentCRatio.dividedBy(targetCRatio).toNumber()))
		.multipliedBy(SNXRate);

	// TODO: replace with useMemo
	const weeklyRewards = sUSDRate * feesToDistribute + SNXRate * rewardsToDistribute;
	const stakingAPR =
		(weeklyRewards * (debtBalance.toNumber() / totalsUSDDebt) * 52) / stakedValue.toNumber();

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
						value={formatFiatCurrency(debtBalance ? debtBalance : 0, { sign: '$' })}
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
		color: ${(props) => props.theme.colors.blue};
	}
`;

const APY = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
`;

export default DashboardPage;
