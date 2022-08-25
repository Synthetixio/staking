import { FeePoolData } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { WEEKS_IN_YEAR } from '../constants/date';
import { StakedSNXResponse } from './useStakedSNX';

export const calculateIsBelowCRatio = (
  currentCRatio: Wei,
  targetCRatio: Wei,
  targetThreshold: Wei
) => currentCRatio.gt(targetCRatio.mul(wei(1).add(targetThreshold)));

export const calculateWeeklyRewards = (
  sUSDRate: Wei,
  SNXRate: Wei,
  previousFeePeriodData?: FeePoolData
) => {
  const feesToDistribute = previousFeePeriodData?.feesToDistribute ?? wei(0);
  const rewardsToDistribute = previousFeePeriodData?.rewardsToDistribute ?? wei(0);

  return sUSDRate.mul(feesToDistribute).add(SNXRate.mul(rewardsToDistribute));
};
export const calculateAPRStaked = (
  stakedValue: Wei,
  userDebtBalance: Wei,
  totalsUSDDebt: Wei,
  previousWeekRewardsUsd: Wei
) => {
  if (
    stakedValue.eq(0) ||
    userDebtBalance.eq(0) ||
    totalsUSDDebt.eq(0) ||
    previousWeekRewardsUsd.eq(0)
  ) {
    return wei(0);
  }
  const yearlyExtrapolatedRewards = previousWeekRewardsUsd.mul(WEEKS_IN_YEAR);
  return yearlyExtrapolatedRewards.mul(userDebtBalance.div(totalsUSDDebt)).div(stakedValue);
};
export const calculateAPRNotStaking = (
  SNXRate: Wei,
  isL2: boolean,
  previousWeekRewardsUsd: Wei,
  stakedSnxData?: StakedSNXResponse
) => {
  if (!stakedSnxData || SNXRate.eq(0) || previousWeekRewardsUsd.eq(0)) {
    return wei(0);
  }
  const stakedSnxForNetwork = isL2
    ? stakedSnxData.stakedSnx.optimism
    : stakedSnxData.stakedSnx.ethereum;
  const yearlyExtrapolatedRewards = previousWeekRewardsUsd.mul(WEEKS_IN_YEAR);

  return yearlyExtrapolatedRewards.div(SNXRate.mul(stakedSnxForNetwork));
};
