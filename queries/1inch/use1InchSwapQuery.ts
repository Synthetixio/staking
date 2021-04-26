import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import { isL2State, isWalletConnectedState, networkState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { NumericValue, toBigNumber } from 'utils/formatters/number';
import { parseEther } from 'ethers/lib/utils';
import axios from 'axios';
import { swapEndpoint } from 'constants/1inch';
import { BigNumber as EthersBigNumber } from 'ethers';

export type SwapTxData = {
	from: string;
	to: string;
	data: string;
	value: EthersBigNumber;
	gasPrice: EthersBigNumber;
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
	const isL2 = useRecoilValue(isL2State);

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
				value: EthersBigNumber.from(transaction.value),
				gasPrice: EthersBigNumber.from(transaction.gasPrice),
			};
		},
		{
			enabled: isAppReady && isWalletConnected && !isL2 && !toBigNumber(amount).isZero(),
			...options,
		}
	);
};

export default use1InchSwapQuery;
