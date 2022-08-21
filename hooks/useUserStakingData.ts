import { useCallback, useMemo } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

// exported for test
export const calculateIsBelowCRatio = (
  currentCRatio: Wei,
  targetCRatio: Wei,
  targetThreshold: Wei
) => currentCRatio.gt(targetCRatio.mul(wei(1).add(targetThreshold)));

export const useUserStakingData = (walletAddress: string | null) => {
  const { L1DefaultProvider, isL2 } = Connector.useContainer();

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

  const { useTotalIssuedSynthsExcludeOtherCollateralQuery, useExchangeRatesQuery, useSNXData } =
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

  const { data: lockedSnxData, refetch: lockedSnxRefetch } = useSNXData(L1DefaultProvider!);
  const { data: debtData, refetch: debtRefetch } = useGetDebtDataQuery(walletAddress);

  const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? wei(0);
  const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? wei(0);

  const totalsUSDDebt = wei(totalIssuedSynthsExclOtherCollateral?.data ?? 0);
  const sUSDRate = wei(exchangeRatesData?.sUSD ?? 0);
  const SNXRate = wei(exchangeRatesData?.SNX ?? 0);

  const isBelowCRatio = calculateIsBelowCRatio(currentCRatio, targetCRatio, targetThreshold);

  const stakedValue =
    collateral.gt(0) && currentCRatio.gt(0)
      ? collateral.mul(Wei.min(wei(1), currentCRatio.div(targetCRatio))).mul(SNXRate)
      : wei(0);

  const weeklyRewards = sUSDRate.mul(feesToDistribute).add(SNXRate.mul(rewardsToDistribute));

  let stakingAPR = wei(0);

  // compute APR based on the user staked SNX
  if (stakedValue.gt(0) && debtBalance.gt(0) && totalsUSDDebt.gt(0)) {
    stakingAPR = weeklyRewards
      .mul(debtBalance.div(totalsUSDDebt).mul(WEEKS_IN_YEAR))
      .div(stakedValue);
  } else if (
    SNXRate != null &&
    sUSDRate != null &&
    previousFeePeriod.data != null &&
    currentFeePeriod.data != null &&
    lockedSnxData != null &&
    debtData != null
  ) {
    // compute APR based using useSNXLockedValueQuery (top 1000 holders)
    stakingAPR = isL2
      ? debtData.totalSupply.eq(0)
        ? wei(0)
        : wei(WEEKS_IN_YEAR).mul(rewardsToDistribute).div(debtData.totalSupply)
      : lockedSnxData.lockedValue.eq(0)
      ? wei(0)
      : sUSDRate
          .mul(currentFeePeriod.data.feesToDistribute)
          .add(SNXRate.mul(currentFeePeriod.data.rewardsToDistribute))
          .mul(WEEKS_IN_YEAR)
          .div(lockedSnxData.lockedValue);
  }

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
    lockedSnxRefetch();
    debtRefetch();
    availableRewardsRefetch();
    refetchStaking();
  }, [
    availableRewardsRefetch,
    debtRefetch,
    exchangeRatesRefetch,
    feeClaimsRefetch,
    lockedSnxRefetch,
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
