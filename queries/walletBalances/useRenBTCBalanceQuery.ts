import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

import Connector from 'containers/Connector';
import { toBigNumber } from 'utils/formatters/number';
import { renBTCToken } from 'contracts';

const useRenBTCBalanceQuery = (options?: QueryConfig<BigNumber>) => {
	const { provider } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<BigNumber>(
		QUERY_KEYS.WalletBalances.RenBTC(walletAddress ?? '', network?.id!),
		async () => {
			const contract = new ethers.Contract(
				renBTCToken.address,
				renBTCToken.abi,
				provider as ethers.providers.Provider
			);
			const balance = await contract.balanceOfUnderlying(walletAddress);
			return toBigNumber(ethers.utils.formatUnits(balance, 8));
		},
		{
			enabled: provider && isWalletConnected,
			...options,
		}
	);
};

export default useRenBTCBalanceQuery;
