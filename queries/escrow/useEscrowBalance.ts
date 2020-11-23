import { useQuery, QueryConfig } from 'react-query';
import { SynthetixJS } from '@synthetixio/js';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

type EscrowBalance = {
	stakingEscrow: number;
	tokenSaleEscrow: number;
};
const useEscrowBalanceQuery = (options?: QueryConfig<EscrowBalance>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<EscrowBalance>(
		QUERY_KEYS.Escrow.EscrowBalance(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { RewardEscrow, SynthetixEscrow },
				utils: { formatEther },
			} = synthetix.js as SynthetixJS;
			const stakingEscrow = await RewardEscrow.totalEscrowedAccountBalance(walletAddress);
			const tokenSaleEscrow = await SynthetixEscrow.balanceOf(walletAddress);
			return {
				stakingEscrow: Number(formatEther(stakingEscrow)),
				tokenSaleEscrow: Number(formatEther(tokenSaleEscrow)),
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useEscrowBalanceQuery;
