import Connector from 'containers/Connector';
import { BigNumber, Contract } from 'ethers';
import { useQuery } from 'react-query';

const useGetNeedsApproval = (
  contractSpenderAddress: string,
  contract?: Contract,
  walletAddress?: string | null
) => {
  const { network, provider } = Connector.useContainer();
  return useQuery(
    [network?.id],
    async () => {
      if (!provider || !contract) return false;
      const amount: BigNumber = await contract
        .connect(provider)
        .allowance(walletAddress, contractSpenderAddress);
      return amount.gt(0);
    },
    { enabled: Boolean(provider && walletAddress && contract) }
  );
};

export default useGetNeedsApproval;
