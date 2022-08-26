import { useCallback, useMemo } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { Synths } from 'constants/currency';
import { useStakedSNX } from './useStakedSNX';
import {
  calculateAPRNotStaking,
  calculateAPRStaked,
  calculateIsBelowCRatio,
  calculateWeeklyRewards,
} from './stakingDataCalculations';

export const useUserStakingData = (walletAddress: string | null) => {
  const { isL2 } = Connector.useContainer();

  const { useGetFeePoolDataQuery, useGetDebtDataQuery, useClaimableRewardsQuery, subgraph } =
    useSynthetixQueries();

  const { data: feeClaimsData, refetch: feeClaimsRefetch } = subgraph.useGetFeesClaimeds(
    {
      first: 1,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      where: { account: walletAddress?.toLowerCase() },
    },
    { timestamp: true, rewards: true, value: true }
  );

  const currentFeePeriod = useGetFeePoolDataQuery(0);

  const { useTotalIssuedSynthsExcludeOtherCollateralQuery, useExchangeRatesQuery } =
    useSynthetixQueries();

  const { data: exchangeRatesData, refetch: exchangeRatesRefetch } = useExchangeRatesQuery();

  const totalIssuedSynthsExclOtherCollateral = useTotalIssuedSynthsExcludeOtherCollateralQuery(
    Synths.sUSD
  );

  const previousFeePeriod = useGetFeePoolDataQuery(1);

  const {
    currentCRatio,
    targetCRatio,
    debtBalance,
    collateral,
    targetThreshold,
    refetch: refetchStaking,
  } = useStakingCalculations();

  const { data: stakedSnxData, refetch: stakedSnxRefetch } = useStakedSNX();
  // TODO do we need this refresh?
  const { refetch: debtRefetch } = useGetDebtDataQuery(walletAddress);
  const previousFeePeriodData = previousFeePeriod.data;
  const totalsUSDDebt = wei(totalIssuedSynthsExclOtherCollateral?.data ?? 0);
  const sUSDRate = wei(exchangeRatesData?.sUSD ?? 0);
  const SNXRate = wei(exchangeRatesData?.SNX ?? 0);
  const stakedValue =
    collateral.gt(0) && currentCRatio.gt(0)
      ? collateral.mul(Wei.min(wei(1), currentCRatio.div(targetCRatio))).mul(SNXRate)
      : wei(0);
  const userIsStaking = stakedValue.gt(0) && debtBalance.gt(0) && totalsUSDDebt.gt(0);
  const weeklyRewards = calculateWeeklyRewards(sUSDRate, SNXRate, previousFeePeriodData);
  const stakingAPR = userIsStaking
    ? calculateAPRStaked(stakedValue, debtBalance, totalsUSDDebt, weeklyRewards)
    : calculateAPRNotStaking(SNXRate, isL2, weeklyRewards, stakedSnxData);

  const isBelowCRatio = calculateIsBelowCRatio(currentCRatio, targetCRatio, targetThreshold);

  const { data: availableRewards, refetch: availableRewardsRefetch } = useClaimableRewardsQuery(
    walletAddress,
    {
      enabled: Boolean(walletAddress),
    }
  );

  const tradingRewards = availableRewards?.tradingRewards ?? wei(0);
  const stakingRewards = availableRewards?.stakingRewards ?? wei(0);

  const { currentFeePeriodStarts, nextFeePeriodStarts } = useMemo(() => {
    return {
      currentFeePeriodStarts: new Date(
        currentFeePeriod.data?.startTime ? currentFeePeriod.data.startTime * 1000 : 0
      ),
      nextFeePeriodStarts: new Date(
        currentFeePeriod.data?.startTime
          ? (currentFeePeriod.data.startTime + currentFeePeriod.data.feePeriodDuration) * 1000
          : 0
      ),
    };
  }, [currentFeePeriod]);

  const lastClaimDate = new Date(feeClaimsData?.length ? feeClaimsData[0].timestamp.toNumber() : 0);

  const hasClaimed = lastClaimDate > currentFeePeriodStarts && lastClaimDate < nextFeePeriodStarts;

  const refetch = useCallback(() => {
    feeClaimsRefetch();
    exchangeRatesRefetch();
    stakedSnxRefetch();
    debtRefetch();
    availableRewardsRefetch();
    refetchStaking();
  }, [
    availableRewardsRefetch,
    debtRefetch,
    exchangeRatesRefetch,
    feeClaimsRefetch,
    stakedSnxRefetch,
    refetchStaking,
  ]);

  return {
    hasClaimed,
    stakedValue,
    stakingAPR,
    tradingRewards,
    stakingRewards,
    debtBalance,
    isBelowCRatio,
    refetch,
  };
};

export default useUserStakingData;
