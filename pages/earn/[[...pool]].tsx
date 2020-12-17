import Head from 'next/head';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { StatsSection, LineSpacer } from 'styles/common';
import sumBy from 'lodash/sumBy';

import { Incentives } from 'sections/earn';
import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const Earn = () => {
	const { t } = useTranslation();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { stakedValue, stakingAPR, tradingRewards, stakingRewards } = useUserStakingData();

	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

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
