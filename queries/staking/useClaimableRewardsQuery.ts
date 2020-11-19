import { QueryConfig, useQuery } from 'react-query';
import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';
import BigNumber from 'bignumber.js';

type AvailableFees = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
};

const useClaimableRewards = (options?: QueryConfig<AvailableFees>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<AvailableFees>(
		QUERY_KEYS.Staking.ClaimableRewards(walletAddress ?? '', network?.id!),
		async () => {
			const feesAvailable = await synthetix.js?.contracts.FeePool.feesAvailable(walletAddress);
			const feesAvailableBN = feesAvailable.map((e: BigNumber) =>
				e.isZero() ? toBigNumber(0) : toBigNumber(e)
			);
			return {
				tradingRewards: feesAvailableBN[0],
				stakingRewards: feesAvailableBN[1],
			};
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useClaimableRewards;
