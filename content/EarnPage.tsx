import { FC, useCallback } from 'react';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { LineSpacer } from 'styles/common';

import { Incentives } from 'sections/earn';
import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { delegateWalletState } from 'store/wallet';
import { wei } from '@synthetixio/wei';
import useLiquidationRewards from 'hooks/useLiquidationRewards';
import Connector from 'containers/Connector';

const EarnPage: FC = () => {
  const { t } = useTranslation();

  const { walletAddress } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const addressToUse = delegateWallet?.address || walletAddress!;

  const { useExchangeRatesQuery, subgraph } = useSynthetixQueries();

  const exchangeRatesQuery = useExchangeRatesQuery();
  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
  const { stakedValue, stakingAPR, tradingRewards, stakingRewards, hasClaimed, refetch } =
    useUserStakingData(addressToUse);

  const { data: liquidationData, refetch: liquidationRefetch } =
    useLiquidationRewards(addressToUse);
  const SNXRate = exchangeRatesQuery.data?.SNX ?? wei(0);

  const refetchAllRewards = useCallback(() => {
    refetch();
    liquidationRefetch();
  }, [refetch, liquidationRefetch]);

  const totalRewards = tradingRewards.add(stakingRewards.mul(SNXRate));

  const feeClaims = subgraph.useGetFeesClaimeds(
    {
      first: 1000,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      where: { account: addressToUse?.toLowerCase() },
    },
    { timestamp: true, rewards: true, value: true }
  );

  const totalFees = useMemo(() => {
    let total = wei(0);

    feeClaims.data?.forEach((claim) => {
      const usdAmount = claim.value;
      const snxAmount = claim.rewards ?? wei(0);
      const snxUsdValue = snxAmount.mul(SNXRate);

      total = total.add(usdAmount).add(snxUsdValue);
    });

    return total;
  }, [feeClaims, SNXRate]);

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
        liquidationRewards={liquidationData || wei(0)}
        stakedAmount={SNXRate.eq(0) ? wei(0) : stakedValue.div(SNXRate)}
        hasClaimed={hasClaimed}
        refetchAllRewards={refetchAllRewards}
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

export default EarnPage;
