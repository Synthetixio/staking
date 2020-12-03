import { QueryConfig, useQuery } from 'react-query';
import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import BigNumber from 'bignumber.js';
import { SynthetixJS } from '@synthetixio/js';
import { toBigNumber } from 'utils/formatters/number';

type AvailableFees = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
};

const useClaimableRewards = (options?: QueryConfig<AvailableFees>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	// NOTE / @TODO I think the fields used could be wrong - come back to this
	return useQuery<AvailableFees>(
		QUERY_KEYS.Staking.ClaimableRewards(walletAddress ?? '', network?.id!),
		async () => {
			const {
				contracts: { FeePool },
				utils,
			} = synthetix.js as SynthetixJS;
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
