import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { parseEther } from 'ethers/lib/utils';
import axios from 'axios';
import { swapEndpoint } from 'constants/1inch';
import { ethers } from 'ethers';
import { wei, WeiSource } from '@synthetixio/wei';
import Connector from 'containers/Connector';

export type SwapTxData = {
  from: string;
  to: string;
  data: string;
  value: ethers.BigNumber;
  gasPrice: ethers.BigNumber;
  gas: number;
};

const use1InchSwapQuery = (
  fromTokenAddress: string | null,
  toTokenAddress: string | null,
  amount: WeiSource,
  fromAddress: string,
  slippage: number,
  options?: UseQueryOptions<SwapTxData>
) => {
  const { isAppReady, isWalletConnected, walletAddress, network, isL2 } = Connector.useContainer();

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
      delete transaction.gas;
      return {
        ...transaction,
        value: wei(transaction.value, 0).toBN(),
        gasPrice: wei(transaction.gasPrice, 0).toBN(),
      };
    },
    {
      enabled:
        isAppReady &&
        isWalletConnected &&
        !isL2 &&
        !wei(amount).eq(0) &&
        !!fromTokenAddress &&
        !!toTokenAddress,
      ...options,
    }
  );
};

export default use1InchSwapQuery;
