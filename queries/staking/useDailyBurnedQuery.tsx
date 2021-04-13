import axios from 'axios';
import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState } from 'store/wallet';
import { DailyStakingRecord, StakingTransactionType } from './types';

const useDailyBurnedQuery = (options?: QueryConfig<DailyStakingRecord[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Burned('', network?.id!),
		async () => {
			const {
				data: {
					data: { dailyBurneds },
				},
			} = await axios.post('https://api.thegraph.com/subgraphs/name/clementbalestrat/synthetix', {
				query: `
				{
					dailyBurneds(orderBy: timestamp, orderDirection: asc) {
					  value
					  totalDebt
					  timestamp
					}
				  }
				`,
			});

			return dailyBurneds.map((item: any) => ({
				value: Number(item.value) / 1e18,
				totalDebt: Number(item.totalDebt) / 1e18,
				type: StakingTransactionType.Burned,
				timestamp: Number(item.timestamp) * 1000,
			})) as DailyStakingRecord[];
		},
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};

export default useDailyBurnedQuery;
