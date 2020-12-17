import Head from 'next/head';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { StatsSection, LineSpacer } from 'styles/common';
import sumBy from 'lodash/sumBy';

import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

import { Incentives } from 'sections/earn';
import StatBox from 'components/StatBox';

import { formatFiatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import useClaimableRewards from 'queries/staking/useClaimableRewardsQuery';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const Earn = () => {
	const { t } = useTranslation();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(Synths.sUSD);
	const previousFeePeriod = useGetFeePoolDataQuery('1');
	const { currentCRatio, targetCRatio, debtBalance, collateral } = useStakingCalculations();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	const sUSDRate = exchangeRatesQuery.data?.sUSD ?? 0;
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const stakedValue =
		collateral.toNumber() > 0
			? collateral
					.multipliedBy(Math.min(1 / currentCRatio.dividedBy(targetCRatio).toNumber()))
					.multipliedBy(SNXRate)
			: toBigNumber(0);
	const weeklyRewards = sUSDRate * feesToDistribute + SNXRate * rewardsToDistribute;

	const stakingAPR =
		stakedValue.toNumber() > 0 && debtBalance.toNumber() > 0
			? (weeklyRewards * (debtBalance.toNumber() / totalsUSDDebt) * WEEKS_IN_YEAR) /
			  stakedValue.toNumber()
			: 0;

	const availableRewards = useClaimableRewards();

	const tradingRewards = availableRewards?.data?.tradingRewards ?? toBigNumber(0);
	const stakingRewards = availableRewards?.data?.stakingRewards ?? toBigNumber(0);

	const totalRewards = tradingRewards.plus(stakingRewards.multipliedBy(SNXRate));

	const feeClaimHistoryQuery = useFeeClaimHistoryQuery();

	const feeClaimHistory = useMemo(() => feeClaimHistoryQuery.data ?? [], [
		feeClaimHistoryQuery.data,
	]);

	const totalFees = useMemo(
		() =>
			toBigNumber(
				sumBy(feeClaimHistory, (claim) => {
					const usdAmount = claim.value;
					const snxAmount = claim.rewards ?? 0;
					const snxUsdValue = snxAmount * SNXRate;
					return usdAmount + snxUsdValue;
				})
			),
		[feeClaimHistory, SNXRate]
	);

	return (
		<>
			<Head>
				<title>{t('earn.page-title')}</title>
			</Head>
			<StatsSection>
				<UpcomingRewards
					title={t('common.stat-box.upcoming-rewards')}
					value={formatFiatCurrency(getPriceAtCurrentRate(totalRewards), {
						sign: selectedPriceCurrency.sign,
					})}
				/>
				<APR
					title={t('common.stat-box.earning')}
					value={formatPercent(stakingAPR ? stakingAPR : 0)}
					size="lg"
				/>
				<LifetimeRewards
					title={t('common.stat-box.lifetime-rewards')}
					value={formatFiatCurrency(getPriceAtCurrentRate(totalFees), {
						sign: selectedPriceCurrency.sign,
					})}
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
const APR = styled(StatBox)`
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
