import useSynthetixQueries from '@synthetixio/queries';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { isAfter, isBefore } from 'date-fns';

export const useClaimedStatus = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { useFeeClaimHistoryQuery, useGetFeePoolDataQuery } = useSynthetixQueries();

	const history = useFeeClaimHistoryQuery(walletAddress);
	const currentFeePeriod = useGetFeePoolDataQuery(0);

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

	return history.data
		? history.data?.some((tx) => {
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
