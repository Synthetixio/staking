import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { networkState } from 'store/wallet';
import { DailyStakingRecord } from './types';
import { appReadyState } from 'store/app';

const useDailyBurnedQuery = (options?: QueryConfig<DailyStakingRecord[]>) => {
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Burned('', network?.id!),
		async () => {
			const now = new Date();
			const minTimestamp = now.getTime() / 1000 - 180 * 86400;
			const dailyBurneds = await snxData.snx.dailyBurned({ max: 6 * 30, minTimestamp });
			return dailyBurneds;
		},
		{
			enabled: snxData && isAppReady,
			...options,
		}
	);
};

export default useDailyBurnedQuery;
