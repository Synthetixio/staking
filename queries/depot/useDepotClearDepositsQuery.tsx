import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';

type ClearDepositsTransaction = {
	block: number;
	date: Date;
	depositIndex: number;
	fromAddress: string;
	fromETHAmount: number;
	hash: string;
	timestamp: number;
	toAmount: number;
};

const useDepotClearDepositsQuery = (options?: QueryConfig<ClearDepositsTransaction[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<ClearDepositsTransaction[]>(
		QUERY_KEYS.Depot.UserActions(walletAddress ?? '', network?.id!),
		async () => {
			const transactions = await snxData.depot.clearedDeposits({
				toAddress: walletAddress,
			});

			return transactions;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useDepotClearDepositsQuery;
