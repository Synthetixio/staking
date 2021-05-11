import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { isL2State, isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { NumericValue, toBigNumber, zeroBN } from 'utils/formatters/number';
import { formatEther, parseEther } from 'ethers/lib/utils';
import axios from 'axios';
import { quoteEndpoint } from 'constants/1inch';

type QuoteData = {
	toTokenAmount: NumericValue;
};

const use1InchQuoteQuery = (
	fromTokenAddress: string,
	toTokenAddress: string,
	amount: NumericValue,
	options?: QueryConfig<QuoteData>
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
			const toTokenAmount: NumericValue = formatEther(response.data.toTokenAmount);
			return {
				toTokenAmount,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && !isL2 && toBigNumber(amount).gt(zeroBN),
			...options,
		}
	);
};

export default use1InchQuoteQuery;
