import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { toBigNumber } from 'utils/formatters/number';

const useSNXBalanceQuery = (options?: QueryConfig<BigNumber>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<BigNumber>(
		QUERY_KEYS.WalletBalances.SNX(walletAddress ?? '', network?.id!),
		async () => {
			const balance = await synthetix.js?.contracts.Synthetix.collateral(walletAddress);

			return toBigNumber(ethers.utils.formatEther(balance));
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useSNXBalanceQuery;
