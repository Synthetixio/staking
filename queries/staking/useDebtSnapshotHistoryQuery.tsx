import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { HistoricalDebtSnapshot } from './types';

const useDebtSnapshotHistoryQuery = (options?: QueryConfig<HistoricalDebtSnapshot[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<HistoricalDebtSnapshot[]>(
		QUERY_KEYS.Debt.DebtSnapshot(walletAddress ?? '', network?.id!),
		async () => {
			const debtHistory = (await snxData.snx.debtSnapshot({
				account: walletAddress,
			})) as HistoricalDebtSnapshot[];

			return debtHistory;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useDebtSnapshotHistoryQuery;
