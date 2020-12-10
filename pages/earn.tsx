import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { StatsSection, LineSpacer } from 'styles/common';

import { SYNTHS_MAP } from 'constants/currency';

import { Incentives } from 'sections/earn';
import StatBox from 'components/StatBox';

import { formatFiatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import useClaimableRewards from 'queries/staking/useClaimableRewardsQuery';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

const Earn = () => {
	const { t } = useTranslation();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(SYNTHS_MAP.sUSD);
	const previousFeePeriod = useGetFeePoolDataQuery('1');
	const { currentCRatio, targetCRatio, debtBalance, collateral } = useStakingCalculations();

	const sUSDRate = exchangeRatesQuery.data?.sUSD ?? 0;
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const stakedValue = collateral
		.multipliedBy(Math.min(1 / currentCRatio.dividedBy(targetCRatio).toNumber()))
		.multipliedBy(SNXRate);
	const weeklyRewards = sUSDRate * feesToDistribute + SNXRate * rewardsToDistribute;

	const stakingAPR =
		(weeklyRewards * (debtBalance.toNumber() / totalsUSDDebt) * 52) / stakedValue.toNumber();

	const availableRewards = useClaimableRewards();

	const tradingRewards = availableRewards?.data?.tradingRewards ?? toBigNumber(0);
	const stakingRewards = availableRewards?.data?.stakingRewards ?? toBigNumber(0);

	const totalRewards = tradingRewards.plus(stakingRewards.multipliedBy(SNXRate));

	const feeClaimHistoryQuery = useFeeClaimHistoryQuery();

	const feeClaimHistory = feeClaimHistoryQuery.data ?? [];

	const claimHistoryValues: number[] = feeClaimHistory.map((e) => {
		const usdAmount = e.value;
		const snxAmount = e.rewards ?? 0;
		const snxUsdValue = snxAmount * SNXRate;
		return usdAmount + snxUsdValue;
	});

	const totalFees = claimHistoryValues.reduce((a, b) => a + b, 0);

	// const refetch = () => {
	// 	availableRewards.refetch();
	// 	feeClaimHistoryQuery.refetch();
	// };

	return (
		<>
			<Head>
				<title>{t('earn.page-title')}</title>
			</Head>
			<StatsSection>
				<UpcomingRewards
					title={t('common.stat-box.upcoming-rewards')}
					value={formatFiatCurrency(totalRewards, {
						sign: '$',
					})}
				/>
				<APY
					title={t('common.stat-box.earning')}
					value={formatPercent(stakingAPR ? stakingAPR : 0)}
					size="lg"
				/>
				<LifetimeRewards
					title={t('common.stat-box.lifetime-rewards')}
					value={formatFiatCurrency(totalFees ? totalFees : 0, { sign: '$' })}
				/>
			</StatsSection>
			<LineSpacer />
			<Incentives
				tradingRewards={tradingRewards}
				stakingRewards={stakingRewards}
				totalRewards={totalRewards}
				stakingAPR={stakingAPR}
				stakedValue={stakedValue.toNumber()}
			/>
		</>
	);
};

const UpcomingRewards = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
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
const LifetimeRewards = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
`;

export default Earn;
