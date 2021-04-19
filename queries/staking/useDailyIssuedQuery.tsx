import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState } from 'store/wallet';
import { DailyStakingRecord } from './types';

const useDailyIssuedQuery = (options?: QueryConfig<DailyStakingRecord[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Issued('', network?.id!),
		async () => {
			const now = new Date();
			const minTimestamp = now.getTime() / 1000 - 180 * 86400;
			const dailyIssueds = await snxData.snx.dailyIssued({ max: 6 * 30, minTimestamp });
			return dailyIssueds;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useDailyIssuedQuery;
