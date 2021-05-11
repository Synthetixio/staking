import { QueryConfig, useQuery } from 'react-query';
import synthetix from 'lib/synthetix';
import BN from 'bn.js';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';

type AvailableFees = {
	tradingRewards: BN;
	stakingRewards: BN;
};

const useClaimableRewards = (options?: QueryConfig<AvailableFees>) => {
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
				tradingRewards: toBigNumber(utils.formatEther(feesAvailable[0])),
				stakingRewards: toBigNumber(utils.formatEther(feesAvailable[1])),
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useClaimableRewards;
