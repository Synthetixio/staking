import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';
import { wETHToken } from 'contracts';

const useWETHBalanceQuery = (options?: QueryConfig<BigNumber>) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<BigNumber>(
		QUERY_KEYS.WalletBalances.WETH(walletAddress ?? '', network?.id!),
		async () => {
			const contract = new ethers.Contract(
				wETHToken.address,
				wETHToken.abi,
				provider as ethers.providers.Provider
			);
			const balance = await contract.balanceOf(walletAddress);
			return toBigNumber(ethers.utils.formatEther(balance));
		},
		{
			enabled: provider && isWalletConnected,
			...options,
		}
	);
};

export default useWETHBalanceQuery;
