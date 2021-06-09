import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useClaimableRewards from 'queries/staking/useClaimableRewardsQuery';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import { isL2State } from 'store/wallet';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { NetworkId } from '@synthetixio/contracts-interface';

export const useUserStakingData = (networkId: NetworkId) => {
	const [hasClaimed, setHasClaimed] = useState<boolean>(false);
	const isL2 = useRecoilValue(isL2State);
	const history = useFeeClaimHistoryQuery();
	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const { useTotalIssuedSynthsExcludingEtherQuery, useExchangeRatesQuery } = useSynthetixQueries({
		networkId,
	});
	const exchangeRatesQuery = useExchangeRatesQuery();
	const totalIssuedSynthsExclEth = useTotalIssuedSynthsExcludingEtherQuery(Synths.sUSD);
	const previousFeePeriod = useGetFeePoolDataQuery('1');
	const { currentCRatio, targetCRatio, debtBalance, collateral } = useStakingCalculations(
		networkId
	);
	const useSNXLockedValue = useSNXLockedValueQuery();
	const debtData = useGetDebtDataQuery();
	const feesToDistribute = previousFeePeriod?.data?.feesToDistribute ?? 0;
	const rewardsToDistribute = previousFeePeriod?.data?.rewardsToDistribute ?? 0;
	const rewardsToDistributeBN = previousFeePeriod?.data?.rewardsToDistributeBN ?? wei(0);

	const totalsUSDDebt = totalIssuedSynthsExclEth?.data ?? 0;
	const sUSDRate = wei(exchangeRatesQuery.data?.sUSD ?? 0);
	const SNXRate = wei(exchangeRatesQuery.data?.SNX ?? 0);

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
		useSNXLockedValue.data != null &&
		debtData.data != null
	) {
		// compute APR based using useSNXLockedValueQuery (top 1000 holders)
		stakingAPR = isL2
			? wei(WEEKS_IN_YEAR).mul(rewardsToDistributeBN).div(debtData.data.totalSupply).toNumber()
			: sUSDRate
					.mul(currentFeePeriod.data.feesToDistribute)
					.add(SNXRate.mul(currentFeePeriod.data.rewardsToDistribute))
					.mul(WEEKS_IN_YEAR)
					.div(useSNXLockedValue.data)
					.toNumber();
	}

	const availableRewards = useClaimableRewards();

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
	};
};

export default useUserStakingData;
