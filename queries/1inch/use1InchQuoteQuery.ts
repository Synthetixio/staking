import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { isL2State, isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { formatEther, parseEther } from 'ethers/lib/utils';
import axios from 'axios';
import { quoteEndpoint } from 'constants/1inch';
import { wei, WeiSource } from '@synthetixio/wei';

type QuoteData = {
	toTokenAmount: WeiSource;
};

const use1InchQuoteQuery = (
	fromTokenAddress: string | null,
	toTokenAddress: string | null,
	amount: WeiSource,
	options?: UseQueryOptions<QuoteData>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<QuoteData>(
		QUERY_KEYS.Swap.quote1Inch(walletAddress ?? '', network?.id!, amount),
		async () => {
			const response = await axios.get(quoteEndpoint, {
				params: {
					fromTokenAddress,
					toTokenAddress,
					amount: parseEther(amount.toString()).toString(),
				},
			});
			const toTokenAmount: WeiSource = formatEther(response.data.toTokenAmount);
			return {
				toTokenAmount,
			};
		},
		{
			enabled:
				isAppReady &&
				isWalletConnected &&
				!isL2 &&
				!wei(amount).eq(0) &&
				wei(amount).gt(0) &&
				!!fromTokenAddress &&
				!!toTokenAddress,
			...options,
		}
	);
};

export default use1InchQuoteQuery;
