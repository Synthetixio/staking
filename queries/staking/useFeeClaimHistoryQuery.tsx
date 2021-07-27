import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import {
	isWalletConnectedState,
	networkState,
	walletAddressState,
	delegateWalletState,
} from 'store/wallet';
import { HistoricalStakingTransaction } from './types';

const useFeeClaimHistoryQuery = (options?: QueryConfig<HistoricalStakingTransaction[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const network = useRecoilValue(networkState);

	const wallet = delegateWallet?.address ?? walletAddress;

	return useQuery<HistoricalStakingTransaction[]>(
		QUERY_KEYS.Staking.FeeClaimHistory(wallet ?? '', network?.id!),
		async () => {
			const feesClaimed = (await snxData.snx.feesClaimed({
				account: wallet,
			})) as HistoricalStakingTransaction[];

			return feesClaimed;
		},
		{
			enabled: snxData && isWalletConnected,
			...options,
		}
	);
};

export default useFeeClaimHistoryQuery;
