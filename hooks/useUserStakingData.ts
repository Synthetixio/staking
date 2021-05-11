import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useClaimableRewards from 'queries/staking/useClaimableRewardsQuery';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

import { toBigNumber, zeroBN, mulBN, divBN } from 'utils/formatters/number';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import { isL2State } from 'store/wallet';

export const useUserStakingData = () => {
	const [hasClaimed, setHasClaimed] = useState<boolean>(false);
	const isL2 = useRecoilValue(isL2State);
	const history = useFeeClaimHistoryQuery();
	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const exchangeRatesQuery = useExchangeRatesQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(Synths.sUSD);
	const previousFeePeriod = useGetFeePoolDataQuery('1');
	const { debtBalance, stakedCollateralValue, stakedCollateral } = useStakingCalculations();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const debtData = useGetDebtDataQuery();
	const { currentFeePeriodStarted, nextFeePeriodStarts } = useFeePeriodTimeAndProgress();
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? zeroBN;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? zeroBN;
	const rewardsToDistributeBN = previousFeePeriod?.data?.rewardsToDistributeBN ?? zeroBN;

	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? zeroBN;
	const sUSDRate = exchangeRatesQuery.data?.sUSD ?? zeroBN;
	const SNXRate = exchangeRatesQuery.data?.SNX ?? zeroBN;

	const weeklyRewards = mulBN(sUSDRate, feesToDistribute).add(mulBN(SNXRate, rewardsToDistribute));

	let stakingAPR = zeroBN;

	// compute APR based on the user staked SNX
	if (stakedCollateralValue.gt(zeroBN) && debtBalance.gt(zeroBN)) {
		stakingAPR = weeklyRewards
			.mul(mulBN(divBN(debtBalance, totalsUSDDebt), toBigNumber(WEEKS_IN_YEAR * 1e18)))
			.div(stakedCollateralValue);
	} else if (
		SNXRate != null &&
		sUSDRate != null &&
		previousFeePeriod.data != null &&
		currentFeePeriod.data != null &&
		useSNXLockedValue.data != null &&
		debtData.data != null
	) {
		// compute APR based using useSNXLockedValueQuery (top 1000 holders)
		stakingAPR = isL2
			? toBigNumber(WEEKS_IN_YEAR).mul(rewardsToDistributeBN).div(debtData.data.totalSupply)
			: sUSDRate
					.mul(toBigNumber(currentFeePeriod.data.feesToDistribute))
					.add(SNXRate.mul(toBigNumber(currentFeePeriod.data.rewardsToDistribute)))
					.mul(toBigNumber(WEEKS_IN_YEAR))
					.div(toBigNumber(useSNXLockedValue.data));
	}

	const availableRewards = useClaimableRewards();

	const tradingRewards = availableRewards?.data?.tradingRewards ?? zeroBN;
	const stakingRewards = availableRewards?.data?.stakingRewards ?? zeroBN;

	useEffect(() => {
		const checkClaimedStatus = () =>
			setHasClaimed(
				history.data
					? history.data?.some((tx) => {
							const claimedDate = new Date(tx.timestamp);
							return claimedDate > currentFeePeriodStarted && claimedDate < nextFeePeriodStarts;
					  })
					: false
			);
		checkClaimedStatus();
	}, [history, currentFeePeriodStarted, nextFeePeriodStarts]);

	return {
		hasClaimed,
		stakedCollateral,
		stakedValue: stakedCollateralValue,
		stakingAPR,
		tradingRewards,
		stakingRewards,
		debtBalance,
	};
};

export default useUserStakingData;
