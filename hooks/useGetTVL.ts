import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';
import Connector from '../containers/Connector';
import { useStakedSNX } from './useStakedSNX';

export const useGetTVL = () => {
  const { isL2 } = Connector.useContainer();
  const stakedSnxQuery = useStakedSNX();

  const { useExchangeRatesQuery } = useSynthetixQueries();
  const { data: exchangeRateData } = useExchangeRatesQuery();

  return useQuery(
    ['tvl', isL2],
    () => {
      const snxStakedForNetworkNumber = isL2
        ? stakedSnxQuery.data?.stakedSnx.optimism
        : stakedSnxQuery.data?.stakedSnx.ethereum;
      const stakedSnxForNetworkWei = wei(snxStakedForNetworkNumber ?? 0);
      const snxPrice = exchangeRateData?.SNX ?? wei(0);
      const tvl = stakedSnxForNetworkWei.mul(snxPrice);
      return tvl;
    },
    {
      enabled: Boolean(exchangeRateData && stakedSnxQuery.data),
      staleTime: 600000, // 10 min
    }
  );
};
