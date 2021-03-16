import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { NumericValue, toBigNumber } from 'utils/formatters/number';
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
			const toTokenAmountString: string = response.data.toTokenAmount;
			const toTokenAmount: NumericValue = toBigNumber(formatEther(toTokenAmountString));
			return {
				toTokenAmount,
			};
		},
		{
			enabled:
				isAppReady &&
				isWalletConnected &&
				!toBigNumber(amount).isZero() &&
				toBigNumber(amount).isPositive(),
			...options,
		}
	);
};

export default use1InchQuoteQuery;
