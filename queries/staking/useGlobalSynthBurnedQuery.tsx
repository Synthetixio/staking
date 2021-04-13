import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState } from 'store/wallet';
import { HistoricalStakingTransaction } from './types';

const getBurnedStartingFromTs = async (ts: number): Promise<HistoricalStakingTransaction[]> => {
	const transactions = (await snxData.snx.burned({
		minTimestamp: ts,
		max: 1000,
		orderDirection: 'asc',
	})) as HistoricalStakingTransaction[];
	console.log('Getting burned starting from', ts, `got ${transactions.length} results`);

	if (transactions.length > 0) {
		const latestTxnTs = Math.ceil(transactions[transactions.length - 1].timestamp / 1000);
		return transactions.concat(await getBurnedStartingFromTs(latestTxnTs + 1));
	}

	return transactions;
};

const useGlobalSynthBurnedQuery = (
	minTimestamp?: number,
	options?: QueryConfig<HistoricalStakingTransaction[]>
) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);

	return useQuery<HistoricalStakingTransaction[]>(
		QUERY_KEYS.Staking.Burned('', network?.id!),
		async () => {
			const timestamp = minTimestamp || Math.floor(Date.now() / 1000);
			const transactions = await getBurnedStartingFromTs(timestamp);
			console.log(`Got total ${transactions.length} burned txns`);
			return transactions;
		},
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};

export default useGlobalSynthBurnedQuery;
