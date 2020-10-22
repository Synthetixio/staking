import { useQuery, QueryConfig } from 'react-query';
import { SynthetixJS } from '@synthetixio/js';

import synthetix from 'lib/synthetix';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';

export type DebtSnapshot = any;

const useStakedValueAtBlockQuery = (block: number, options?: QueryConfig<DebtSnapshot>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	return useQuery<DebtSnapshot>(
		QUERY_KEYS.Debt.DebtSnapshot(walletAddress ?? '', network?.id!),
		async () => {
			const [debtSnapshot] = await Promise.all([
				snxData.snx.debtSnapshot({ account: walletAddress, maxBlock: block }),
			]);

			console.log(debtSnapshot);

			// const debtSnapshotHistory = flatten(
			// 	[feesClaimed].map((eventType) => {
			// 		return eventType.map((event: any) => {
			// 			return event;
			// 		});
			// 	})
			// );

			return {};
		},
		{
			enabled: synthetix.js && isWalletConnected,
			...options,
		}
	);
};

export default useStakedValueAtBlockQuery;
