import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { networkState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { DailyStakingRecord } from './types';

const useDailyIssuedQuery = (options?: UseQueryOptions<DailyStakingRecord[]>) => {
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	const SECONDS_PER_DAY = 86400;
	const DAYS_TO_QUERY = 180;

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Issued('', network?.id!),
		async () => {
			const now = new Date();
			const minTimestamp = now.getTime() / 1000 - DAYS_TO_QUERY * SECONDS_PER_DAY;
			const dailyIssueds = await snxData.snx.dailyIssued({ max: DAYS_TO_QUERY, minTimestamp });
			return dailyIssueds;
		},
		{
			enabled: snxData && isAppReady,
			...options,
		}
	);
};

export default useDailyIssuedQuery;
