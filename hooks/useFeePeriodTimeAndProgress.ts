import { useMemo } from 'react';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import { zeroBN } from 'utils/formatters/number';

function useFeePeriodTimeAndProgress() {
	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const startTime = Number(currentFeePeriod?.data?.startTime ?? zeroBN);
	const feePeriodDuration = Number(currentFeePeriod?.data?.feePeriodDuration ?? zeroBN);

	const [nextFeePeriodStarts, currentFeePeriodProgress, currentFeePeriodStarted] = useMemo(
		() => [
			new Date((startTime + feePeriodDuration) * 1000),
			(Date.now() / 1000 - startTime) / feePeriodDuration,
			new Date(startTime * 1000),
		],
		[startTime, feePeriodDuration]
	);

	return {
		nextFeePeriodStarts,
		currentFeePeriodProgress,
		currentFeePeriodStarted,
	};
}

export default useFeePeriodTimeAndProgress;
