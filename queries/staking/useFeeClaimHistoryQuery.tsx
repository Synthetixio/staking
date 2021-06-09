import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { HistoricalStakingTransaction } from './types';

const useFeeClaimHistoryQuery = (options?: UseQueryOptions<HistoricalStakingTransaction[]>) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<HistoricalStakingTransaction[]>(
		QUERY_KEYS.Staking.FeeClaimHistory(walletAddress ?? '', network?.id!),
		async () => {
			const feesClaimed = (await snxData.snx.feesClaimed({
				account: walletAddress,
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
