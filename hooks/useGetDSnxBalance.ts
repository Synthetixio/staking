import Wei, { wei } from '@synthetixio/wei';
import { dSNXContractMainnet, dSNXPoolContractOptimism } from 'constants/dhedge';
import Connector from 'containers/Connector';
import { useQuery, UseQueryOptions } from 'react-query';

const useGetDSnxBalance = (queryOptions?: UseQueryOptions<Wei>) => {
  const { provider, network, walletAddress, isMainnet } = Connector.useContainer();

  const dSNXContract = isMainnet ? dSNXContractMainnet : dSNXPoolContractOptimism;

  return useQuery(
    [walletAddress, isMainnet, dSNXContract.address],
    async () => {
      if (!walletAddress) return wei(0);
      if (!provider) return wei(0);

      const balance = await dSNXContract.connect(provider).balanceOf(walletAddress);
      return wei(balance);
    },
    {
      enabled: Boolean(walletAddress && network?.name && provider),
      ...queryOptions,
    }
  );
};

export default useGetDSnxBalance;
