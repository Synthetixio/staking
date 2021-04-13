import axios from 'axios';
import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState } from 'store/wallet';
import { DailyStakingRecord, StakingTransactionType } from './types';

const useDailyIssuedQuery = (options?: QueryConfig<DailyStakingRecord[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);

	return useQuery<DailyStakingRecord[]>(
		QUERY_KEYS.Staking.Issued('', network?.id!),
		async () => {
			const {
				data: {
					data: { dailyIssueds },
				},
			} = await axios.post('https://api.thegraph.com/subgraphs/name/clementbalestrat/synthetix', {
				query: `
				{
					dailyIssueds(orderBy: timestamp, orderDirection: asc) {
					  value
					  totalDebt
					  timestamp
					}
				  }
				`,
			});

			return dailyIssueds.map((item: any) => ({
				value: Number(item.value) / 1e18,
				totalDebt: Number(item.totalDebt) / 1e18,
				type: StakingTransactionType.Issued,
				timestamp: Number(item.timestamp) * 1000,
			})) as DailyStakingRecord[];
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useDailyIssuedQuery;
