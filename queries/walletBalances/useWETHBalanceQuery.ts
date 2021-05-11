import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import {
	walletAddressState,
	isWalletConnectedState,
	networkState,
	isMainnetState,
} from 'store/wallet';

import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';
import { wETHToken } from 'contracts';

const useWETHBalanceQuery = (options?: QueryConfig<BN>) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isMainnet = useRecoilValue(isMainnetState);

	const contract = new ethers.Contract(
		wETHToken.address,
		wETHToken.abi,
		provider as ethers.providers.Provider
	);

	return useQuery<BN>(
		QUERY_KEYS.WalletBalances.WETH(walletAddress ?? '', network?.id!),
		async () => {
			const balance = await contract.balanceOf(walletAddress);
			return toBigNumber(ethers.utils.formatEther(balance));
		},
		{
			enabled: provider && isWalletConnected && isMainnet,
			...options,
		}
	);
};

export default useWETHBalanceQuery;
