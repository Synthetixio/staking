import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState } from 'store/wallet';
import { DailyStakingRecord } from './types';

const useDailyBurnedQuery = (options?: QueryConfig<DailyStakingRecord[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Burned('', network?.id!),
		async () => {
			const now = new Date();
			const minTimestamp = now.getTime() / 1000 - 180 * 86400;
			const dailyBurneds = await snxData.snx.dailyBurned({ max: 6 * 30, minTimestamp });
			return dailyBurneds;
		},
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};

export default useDailyBurnedQuery;
