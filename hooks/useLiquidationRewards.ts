import Wei, { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';
import { BigNumber } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';

const useLiquidationRewards = (address: string | null, options?: UseQueryOptions<Wei>) => {
  const { network, synthetixjs } = Connector.useContainer();

  return useQuery<Wei>(
    ['liquidationRewards', address, network?.id],
    async () => {
      if (!synthetixjs) return wei(0);
      const earnedBn: BigNumber = await synthetixjs?.contracts.LiquidatorRewards.earned(address);
      return wei(earnedBn);
    },
    { enabled: Boolean(address && network?.id && synthetixjs?.contracts), ...options }
  );
};

export default useLiquidationRewards;
