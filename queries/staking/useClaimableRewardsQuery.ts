import { UseQueryOptions, useQuery } from 'react-query';
import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import Wei, { wei } from '@synthetixio/wei';

type AvailableFees = {
	tradingRewards: Wei;
	stakingRewards: Wei;
};

const useClaimableRewards = (options?: UseQueryOptions<AvailableFees>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<AvailableFees>(
		QUERY_KEYS.Staking.ClaimableRewards(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { FeePool },
				utils,
			} = synthetix.js!;
			const feesAvailable = await FeePool.feesAvailable(walletAddress);
			return {
				tradingRewards: wei(utils.formatEther(feesAvailable[0])),
				stakingRewards: wei(utils.formatEther(feesAvailable[1])),
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useClaimableRewards;
