import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { NumericValue, toBigNumber } from 'utils/formatters/number';
import { parseEther } from 'ethers/lib/utils';
import axios from 'axios';
import { swapEndpoint } from 'constants/1inch';

export type SwapTxData = {
	from: string;
	to: string;
	data: string;
	value: string;
	gasPrice: string;
	gas: number;
};

const use1InchSwapQuery = (
	fromTokenAddress: string,
	toTokenAddress: string,
	amount: NumericValue,
	fromAddress: string,
	slippage: number,
	options?: QueryConfig<SwapTxData>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<SwapTxData>(
		QUERY_KEYS.Swap.swap1Inch(walletAddress ?? '', network?.id!, amount, fromAddress),
		async () => {
			const response = await axios.get(swapEndpoint, {
				params: {
					fromTokenAddress,
					toTokenAddress,
					amount: parseEther(amount.toString()).toString(),
					fromAddress,
					slippage: slippage.toString(),
				},
			});

			const transaction = response.data.tx;
			return {
				...transaction,
			};
		},
		{
			enabled: isAppReady && isWalletConnected && !toBigNumber(amount).isZero(),
			...options,
		}
	);
};

export default use1InchSwapQuery;
