import { useQuery, UseQueryOptions } from 'react-query';

import { dSNXPoolAddressOptimism } from 'constants/dhedge';
import Connector from 'containers/Connector';
import { Contract } from 'ethers';
import { abi } from 'contracts/dHedgePoolLogic';
import Wei, { wei } from '@synthetixio/wei';

const contract = new Contract(dSNXPoolAddressOptimism, abi);

const useGetDSNXPrice = (walletAddress: string | null, queryOptions?: UseQueryOptions<Wei>) => {
  const { provider, network } = Connector.useContainer();

  return useQuery(
    [walletAddress, network?.name],
    async () => {
      if (!walletAddress) return wei(0);
      if (!provider) return wei(0);
      if (!network?.name) return wei(0);
      const price = await contract.connect(provider).tokenPrice();
      return wei(price);
    },
    {
      enabled: Boolean(walletAddress && network?.name && provider),
      ...queryOptions,
    }
  );
};
export default useGetDSNXPrice;
