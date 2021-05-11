import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import BN from 'bn.js';

import QUERY_KEYS from 'constants/queryKeys';

import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';

import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';
import { wBTCToken } from 'contracts';

const useWBTCBalanceQuery = (options?: QueryConfig<BN>) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);

	const contract = new ethers.Contract(
		wBTCToken.address,
		wBTCToken.abi,
		provider as ethers.providers.Provider
	);

	return useQuery<BN>(
		QUERY_KEYS.WalletBalances.WBTC(walletAddress ?? '', network?.id!),
		async () => {
			const balance = await contract.balanceOf(walletAddress);
			return toBigNumber(ethers.utils.formatUnits(balance, 8));
		},
		{
			enabled: provider && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useWBTCBalanceQuery;
