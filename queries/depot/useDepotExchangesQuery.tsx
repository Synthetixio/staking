import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { CurrencyKey } from 'constants/currency';

type ClearDepositsTransaction = {
	hash: string;
	from: string;
	fromAmount: number;
	fromCurrency: CurrencyKey;
	toAmount: number;
	toCurrency: CurrencyKey;
	block: number;
	timestamp: number;
	date: Date;
};

const useDepotExchangesQuery = (options?: QueryConfig<ClearDepositsTransaction[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<ClearDepositsTransaction[]>(
		QUERY_KEYS.Depot.Exchanges(walletAddress ?? '', network?.id!),
		async () => {
			const transactions = await snxData.depot.exchanges({
				from: walletAddress,
			});

			return transactions;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useDepotExchangesQuery;
