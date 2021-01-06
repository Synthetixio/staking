import { useEffect, useMemo, useState } from 'react';

import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useTotalIssuedSynthsExcludingEtherQuery from 'queries/synths/useTotalIssuedSynthsExcludingEtherQuery';
import useClaimableRewards from 'queries/staking/useClaimableRewardsQuery';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

import { toBigNumber, zeroBN } from 'utils/formatters/number';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';

export const useUserStakingData = () => {
	const [hasClaimed, setHasClaimed] = useState<boolean>(false);
	const history = useFeeClaimHistoryQuery();
	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const exchangeRatesQuery = useExchangeRatesQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(Synths.sUSD);
	const previousFeePeriod = useGetFeePoolDataQuery('1');
	const { currentCRatio, targetCRatio, debtBalance, collateral } = useStakingCalculations();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const sUSDRate = toBigNumber(exchangeRatesQuery.data?.sUSD ?? 0);
	const SNXRate = toBigNumber(exchangeRatesQuery.data?.SNX ?? 0);

	const stakedValue =
		collateral.gt(0) && currentCRatio.gt(0)
			? collateral
					.multipliedBy(Math.min(1, currentCRatio.dividedBy(targetCRatio).toNumber()))
					.multipliedBy(SNXRate)
			: zeroBN;

	const weeklyRewards = sUSDRate
		.multipliedBy(feesToDistribute)
		.plus(SNXRate.multipliedBy(rewardsToDistribute));

	let stakingAPR = 0;

	if (stakedValue.gt(0) && debtBalance.gt(0)) {
		stakingAPR = weeklyRewards
			.multipliedBy(debtBalance.dividedBy(totalsUSDDebt).multipliedBy(WEEKS_IN_YEAR))
			.dividedBy(stakedValue)
			.toNumber();
	} else if (
		SNXRate != null &&
		sUSDRate != null &&
		currentFeePeriod.data != null &&
		useSNXLockedValue.data != null
	) {
		stakingAPR = sUSDRate
			.multipliedBy(currentFeePeriod.data.feesToDistribute)
			.plus(SNXRate.multipliedBy(currentFeePeriod.data.rewardsToDistribute))
			.multipliedBy(WEEKS_IN_YEAR)
			.dividedBy(useSNXLockedValue.data)
			.toNumber();
	}

	const availableRewards = useClaimableRewards();

	const tradingRewards = availableRewards?.data?.tradingRewards ?? zeroBN;
	const stakingRewards = availableRewards?.data?.stakingRewards ?? zeroBN;

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
	};
};

export default useUserStakingData;
