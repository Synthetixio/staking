import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

import { isL2State } from 'store/wallet';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

export const useUserStakingData = (walletAddress: string | null) => {
	const [hasClaimed, setHasClaimed] = useState<boolean>(false);
	const isL2 = useRecoilValue(isL2State);

	const {
		useFeeClaimHistoryQuery,
		useGetFeePoolDataQuery,
		useGetDebtDataQuery,
		useClaimableRewardsQuery,
	} = useSynthetixQueries();

	const history = useFeeClaimHistoryQuery(walletAddress || undefined);
	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const {
		useTotalIssuedSynthsExcludingEtherQuery,
		useExchangeRatesQuery,
		useGlobalStakingInfoQuery,
	} = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(Synths.sUSD);
	const previousFeePeriod = useGetFeePoolDataQuery('1');
	const {
		currentCRatio,
		targetCRatio,
		debtBalance,
		collateral,
		targetThreshold,
	} = useStakingCalculations();
	const globalStakingInfo = useGlobalStakingInfoQuery();
	const debtData = useGetDebtDataQuery(walletAddress);
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const rewardsToDistributeBN = previousFeePeriod?.data?.rewardsToDistributeBN ?? wei(0);

	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const sUSDRate = wei(exchangeRatesQuery.data?.sUSD ?? 0);
	const SNXRate = wei(exchangeRatesQuery.data?.SNX ?? 0);

	const isBelowCRatio = currentCRatio.gt(targetCRatio.mul(wei(1).add(targetThreshold)));
	const stakedValue =
		collateral.gt(0) && currentCRatio.gt(0)
			? collateral.mul(Math.min(1, currentCRatio.div(targetCRatio).toNumber())).mul(SNXRate)
			: wei(0);

	const weeklyRewards = sUSDRate.mul(feesToDistribute).add(SNXRate.mul(rewardsToDistribute));

	let stakingAPR = 0;

	// compute APR based on the user staked SNX
	if (stakedValue.gt(0) && debtBalance.gt(0)) {
		stakingAPR = weeklyRewards
			.mul(debtBalance.div(totalsUSDDebt).mul(WEEKS_IN_YEAR))
			.div(stakedValue)
			.toNumber();
	} else if (
		SNXRate != null &&
		sUSDRate != null &&
		previousFeePeriod.data != null &&
		currentFeePeriod.data != null &&
		globalStakingInfo.data != null &&
		debtData.data != null
	) {
		// compute APR based using useSNXLockedValueQuery (top 1000 holders)
		stakingAPR = isL2
			? wei(WEEKS_IN_YEAR).mul(rewardsToDistributeBN).div(debtData.data.totalSupply).toNumber()
			: sUSDRate
					.mul(currentFeePeriod.data.feesToDistribute)
					.add(SNXRate.mul(currentFeePeriod.data.rewardsToDistribute))
					.mul(WEEKS_IN_YEAR)
					.div(globalStakingInfo.data.lockedValue)
					.toNumber();
	}

	const availableRewards = useClaimableRewardsQuery(walletAddress);

	const tradingRewards = availableRewards?.data?.tradingRewards ?? wei(0);
	const stakingRewards = availableRewards?.data?.stakingRewards ?? wei(0);

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

	useEffect(() => {
		const checkClaimedStatus = () =>
			setHasClaimed(
				history.data
					? history.data?.some((tx) => {
							const claimedDate = new Date(tx.timestamp);
							return claimedDate > currentFeePeriodStarts && claimedDate < nextFeePeriodStarts;
					  })
					: false
			);
		checkClaimedStatus();
	}, [history, currentFeePeriodStarts, nextFeePeriodStarts]);

	return {
		hasClaimed,
		stakedValue,
		stakingAPR,
		tradingRewards,
		stakingRewards,
		debtBalance,
		isBelowCRatio,
	};
};

export default useUserStakingData;
