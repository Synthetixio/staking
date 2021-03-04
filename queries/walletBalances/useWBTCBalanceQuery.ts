import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';
import { wBTCToken } from 'contracts';

const useWBTCBalanceQuery = (options?: QueryConfig<BigNumber>) => {
	const { currentProvider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	const contract = new ethers.Contract(
		wBTCToken.address,
		wBTCToken.abi,
		currentProvider as ethers.providers.Provider
	);

	return useQuery<BigNumber>(
		QUERY_KEYS.WalletBalances.WBTC(walletAddress ?? '', network?.id!),
		async () => {
			const balance = await contract.balanceOf(walletAddress);
			return toBigNumber(ethers.utils.formatUnits(balance, 8));
		},
		{
			enabled: currentProvider && isWalletConnected,
			...options,
		}
	);
};

export default useWBTCBalanceQuery;
