import useSynthetixQueries from '@synthetixio/queries';
import { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { isAfter, isBefore } from 'date-fns';
import { Transaction } from 'constants/network';

export const useClaimedStatus = (transactionState?: Transaction) => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { useFeeClaimHistoryQuery, useGetFeePoolDataQuery } = useSynthetixQueries();

	const { data: historyData, refetch } = useFeeClaimHistoryQuery(walletAddress);
	const currentFeePeriod = useGetFeePoolDataQuery(0);
	useEffect(() => {
		// If a transactionState was passed and it just changed to Success, refetch
		if (transactionState === Transaction.SUCCESS) {
			refetch();
		}
	}, [refetch, transactionState]);
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

	return historyData
		? historyData?.some((tx) => {
				const claimedDate = new Date(tx.timestamp);
				return (
					tx.type === 'feesClaimed' &&
					isAfter(claimedDate, currentFeePeriodStarts) &&
					isBefore(claimedDate, nextFeePeriodStarts)
				);
		  })
		: false;
};

export default useClaimedStatus;
