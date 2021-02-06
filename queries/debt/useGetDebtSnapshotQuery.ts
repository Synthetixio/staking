import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';

export type DebtSnapshotData = {
    account: string;
    block: number;
    debtBalanceOf: number;
    timestamp: number;
}
const useSynthIssuedQuery = (options?: QueryConfig<DebtSnapshotData[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<DebtSnapshotData[]>(
		QUERY_KEYS.Debt.DebtSnapshot(walletAddress ?? '', network?.id!),
		async () => {
			const transactions = (await snxData.snx.debtSnapshot({
				account: walletAddress, max: 1000
			})) as DebtSnapshotData[];

			return transactions;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useSynthIssuedQuery;