import Connector from 'containers/Connector';
import { useQuery, UseQueryOptions } from 'react-query';

const useGetCanBurn = (walletAddress: string | null, options?: UseQueryOptions<Boolean>) => {
  const { synthetixjs } = Connector.useContainer();
  const Issuer = synthetixjs?.contracts.Issuer;
  return useQuery(
    ['canBurn', Issuer?.address, walletAddress],
    () => {
      if (!Issuer) {
        throw Error('Expected Issuer contract to be defined');
      }
      return Issuer.canBurnSynths(walletAddress);
    },
    {
      enabled: Boolean(Issuer && walletAddress),
      ...options,
    }
  );
};
export default useGetCanBurn;
