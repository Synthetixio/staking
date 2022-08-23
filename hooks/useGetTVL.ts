import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from '../containers/Connector';
import { useStakedSNX } from './useStakedSNX';

export const useGetTVL = () => {
  const { isL2 } = Connector.useContainer();
  const stakedSnxQuery = useStakedSNX();

  const { useExchangeRatesQuery } = useSynthetixQueries();
  const { data: exchangeRateData } = useExchangeRatesQuery();
  const snxStakedForNetworkNumber = isL2
    ? stakedSnxQuery.data?.stakedSnx.optimism
    : stakedSnxQuery.data?.stakedSnx.ethereum;
  const stakedSnxForNetworkWei = wei(snxStakedForNetworkNumber ?? 0);
  const snxPrice = exchangeRateData?.SNX ?? wei(0);
  const tvl = stakedSnxForNetworkWei.mul(snxPrice);
  const isFetching = !exchangeRateData || !stakedSnxQuery.data;

  return { isFetching, tvl };
};
