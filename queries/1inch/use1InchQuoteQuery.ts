import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { formatEther, parseEther } from 'ethers/lib/utils';
import axios from 'axios';
import { quoteEndpoint } from 'constants/1inch';
import { wei, WeiSource } from '@synthetixio/wei';
import Connector from 'containers/Connector';

type QuoteData = {
  toTokenAmount: WeiSource;
};

const use1InchQuoteQuery = (
  fromTokenAddress: string | null,
  toTokenAddress: string | null,
  amount: WeiSource,
  options?: UseQueryOptions<QuoteData>
) => {
  const { isAppReady, isL2, walletAddress, network, isWalletConnected } = Connector.useContainer();

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
