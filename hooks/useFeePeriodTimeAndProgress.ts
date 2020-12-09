import { useMemo } from 'react';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';

function useFeePeriodTimeAndProgress() {
	const currentFeePeriod = useGetFeePoolDataQuery('0');

	const [nextFeePeriodStarts, currentFeePeriodProgress, currentFeePeriodStarted] = useMemo(
		() => [
			new Date(
				currentFeePeriod.data?.startTime
					? (currentFeePeriod.data.startTime + currentFeePeriod.data.feePeriodDuration) * 1000
					: 0
			),
			currentFeePeriod.data?.startTime
				? (Date.now() / 1000 - currentFeePeriod.data.startTime) /
				  currentFeePeriod.data.feePeriodDuration
				: 0,
			new Date(currentFeePeriod.data?.startTime ? currentFeePeriod.data?.startTime * 1000 : 0),
		],
		[currentFeePeriod.data?.startTime, currentFeePeriod.data?.feePeriodDuration]
	);

	return {
		nextFeePeriodStarts,
		currentFeePeriodProgress,
		currentFeePeriodStarted,
	};
}

export default useFeePeriodTimeAndProgress;
