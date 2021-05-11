import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { toBigNumber } from 'utils/formatters/number';

const useSNXBalanceQuery = (options?: QueryConfig<BN>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<BN>(
		QUERY_KEYS.WalletBalances.SNX(walletAddress ?? '', network?.id!),
		async () => {
			const balance = await synthetix.js?.contracts.Synthetix.collateral(walletAddress);
			return toBigNumber(balance);
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useSNXBalanceQuery;
