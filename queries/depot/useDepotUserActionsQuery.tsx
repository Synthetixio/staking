import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';

export type DepotHistoricalTransactionType = 'deposit' | 'withdrawl' | 'unaccepted' | 'removed';

export type DepotHistoricalTransaction = {
	amount: number;
	block: number;
	date: Date;
	depositIndex: number;
	hash: string;
	minimum: any;
	timestamp: number;
	type: DepotHistoricalTransactionType;
	user: string;
};

const useDepotUserActionsQuery = (options?: QueryConfig<DepotHistoricalTransaction[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<DepotHistoricalTransaction[]>(
		QUERY_KEYS.Depot.UserActions(walletAddress ?? '', network?.id!),
		async () => {
			const transactions = (await snxData.depot.userActions({
				user: walletAddress,
			})) as DepotHistoricalTransaction[];

			return transactions;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useDepotUserActionsQuery;
