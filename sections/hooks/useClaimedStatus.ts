import useSynthetixQueries from '@synthetixio/queries';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

export const useClaimedStatus = () => {
	const [claimed, setClaimed] = useState<boolean>(false);

	const walletAddress = useRecoilValue(walletAddressState);
	const { useFeeClaimHistoryQuery, useGetFeePoolDataQuery } = useSynthetixQueries();

	const history = useFeeClaimHistoryQuery(walletAddress);
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

	useEffect(() => {
		const checkClaimedStatus = () =>
			setClaimed(
				history.data
					? history.data?.some((tx) => {
							const claimedDate = new Date(tx.timestamp);
							return claimedDate > currentFeePeriodStarts && claimedDate < nextFeePeriodStarts;
					  })
					: false
			);
		checkClaimedStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return claimed;
};

export default useClaimedStatus;
