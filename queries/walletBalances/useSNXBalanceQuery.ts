import { useQuery, QueryConfig } from 'react-query';
import { BigNumber } from 'ethers';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';

export type Balance = { balance: number; balanceBN: BigNumber };

const useSNXBalanceQuery = (options?: QueryConfig<Balance>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<Balance>(
		QUERY_KEYS.WalletBalances.SNX(walletAddress ?? '', network?.id!),
		async () => {
			const balanceBN = await synthetix.js?.contracts.Synthetix.collateral(walletAddress);

			return {
				balance: Number(balanceBN) / 1e18,
				balanceBN,
			};
		},
		{
			enabled: synthetix.js && isWalletConnected,
			...options,
		}
	);
};

export default useSNXBalanceQuery;
