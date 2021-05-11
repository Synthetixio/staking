import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';

const useETHBalanceQuery = (options?: QueryConfig<BN>) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<BN>(
		QUERY_KEYS.WalletBalances.ETH(walletAddress ?? '', network?.id!),
		async () => {
			const balance = await provider!.getBalance(walletAddress!);

			return toBigNumber(ethers.utils.formatEther(balance));
		},
		{
			enabled: provider && isWalletConnected,
			...options,
		}
	);
};

export default useETHBalanceQuery;
