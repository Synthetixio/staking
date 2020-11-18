import { useEffect, useMemo, useState } from 'react';
import useFeeClaimHistoryQuery from 'queries/staking/useFeeClaimHistoryQuery';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';

export const useClaimedStatus = () => {
	const [claimed, setClaimed] = useState<boolean>(false);
	const history = useFeeClaimHistoryQuery();
	const currentFeePeriod = useGetFeePoolDataQuery('0');

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

	const checkClaimedStatus = () =>
		setClaimed(
			history.data
				? history.data?.some((tx) => {
						const claimedDate = new Date(tx.timestamp);
						return claimedDate > currentFeePeriodStarts && claimedDate < nextFeePeriodStarts;
				  })
				: false
		);

	useEffect(() => {
		checkClaimedStatus();
	}, [checkClaimedStatus]);

	return claimed;
};

export default useClaimedStatus;
