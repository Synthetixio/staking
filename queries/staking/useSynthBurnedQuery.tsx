import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { HistoricalStakingTransaction } from './types';

const useSynthBurnedQuery = (options?: QueryConfig<HistoricalStakingTransaction[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<HistoricalStakingTransaction[]>(
		QUERY_KEYS.Staking.Burned(walletAddress ?? '', network?.id!),
		async () => {
			const transactions = (await snxData.snx.burned({
				account: walletAddress,
			})) as HistoricalStakingTransaction[];

			return transactions;
		},
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};

export default useSynthBurnedQuery;
