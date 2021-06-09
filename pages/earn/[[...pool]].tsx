import { FC, useEffect } from 'react';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { LineSpacer } from 'styles/common';
import sumBy from 'lodash/sumBy';

import UIContainer from 'containers/UI';
import { Incentives } from 'sections/earn';
import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, formatPercent, toBigNumber } from 'utils/formatters/number';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

const Earn: FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const {
		stakedValue,
		stakingAPR,
		tradingRewards,
		stakingRewards,
		hasClaimed,
	} = useUserStakingData();

	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const totalRewards = tradingRewards.add(stakingRewards.mul(SNXRate));

	const feeClaimHistoryQuery = useFeeClaimHistoryQuery();

	const feeClaimHistory = useMemo(() => feeClaimHistoryQuery.data ?? [], [
		feeClaimHistoryQuery.data,
	]);

	const totalFees = useMemo(
		() =>
			wei(
				sumBy(feeClaimHistory, (claim) => {
					const usdAmount = claim.value;
					const snxAmount = claim.rewards ?? 0;
					const snxUsdValue = snxAmount * SNXRate;
					return usdAmount + snxUsdValue;
				})
			),
		[feeClaimHistory, SNXRate]
	);

	// header title
	useEffect(() => {
		setTitle('staking', 'earn');
	}, [setTitle]);

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
				stakedAmount={stakedValue.div(SNXRate).toNumber()}
				hasClaimed={hasClaimed}
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
