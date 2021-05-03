import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { appReadyState } from 'store/app';
import { networkState } from 'store/wallet';
import { DailyStakingRecord } from './types';

const useDailyBurnedQuery = (options?: QueryConfig<DailyStakingRecord[]>) => {
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	const SECONDS_PER_DAY = 86400;
	const DAYS_TO_QUERY = 180;

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Burned('', network?.id!),
		async () => {
			const now = new Date();
			const minTimestamp = now.getTime() / 1000 - DAYS_TO_QUERY * SECONDS_PER_DAY;
			const dailyBurneds = await snxData.snx.dailyBurned({ max: DAYS_TO_QUERY, minTimestamp });
			return dailyBurneds;
		},
		{
			enabled: snxData && isAppReady,
			...options,
		}
	);
};

export default useDailyBurnedQuery;
