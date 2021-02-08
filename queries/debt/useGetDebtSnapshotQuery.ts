import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import snxData from 'synthetix-data';

type DebtSnapshotData = {
	account: string;
	block: number;
	debtBalanceOf: number;
	timestamp: number;
};

const useGetDebtSnapshotQuery = (options?: QueryConfig<DebtSnapshotData[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<DebtSnapshotData[]>(
		QUERY_KEYS.Debt.DebtSnapshot(walletAddress ?? '', network?.id!),
		async () => {
			return await snxData.snx.debtSnapshot({ account: walletAddress, max: 1000 });
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useGetDebtSnapshotQuery;
