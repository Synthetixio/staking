import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

import { isWalletConnectedState, networkState, walletAddressState, isL2State } from 'store/wallet';
import { appReadyState } from 'store/app';

const useGetDepositsIsActive = (options?: QueryConfig<boolean>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const { provider } = Connector.useContainer();
	const isL2 = useRecoilValue(isL2State);

	return useQuery<boolean>(
		QUERY_KEYS.Deposits.IsActive(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { SynthetixBridgeToOptimism },
			} = synthetix.js!;

			return SynthetixBridgeToOptimism.initiationActive();
		},
		{
			enabled: isAppReady && isWalletConnected && provider && !isL2,
			...options,
		}
	);
};

export default useGetDepositsIsActive;
