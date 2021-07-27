import { QueryConfig, useQuery } from 'react-query';
import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import {
	isWalletConnectedState,
	networkState,
	walletAddressState,
	delegateWalletState,
} from 'store/wallet';
import { appReadyState } from 'store/app';
import BigNumber from 'bignumber.js';
import { toBigNumber } from 'utils/formatters/number';

type AvailableFees = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
};

const useClaimableRewards = (options?: QueryConfig<AvailableFees>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const network = useRecoilValue(networkState);

	const wallet = delegateWallet?.address ?? walletAddress;

	return useQuery<AvailableFees>(
		QUERY_KEYS.Staking.ClaimableRewards(wallet ?? '', network?.id!),
		async () => {
			const {
				contracts: { FeePool },
				utils,
			} = synthetix.js!;
			const feesAvailable = await FeePool.feesAvailable(wallet);
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
