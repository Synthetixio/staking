import Wei, { wei } from '@synthetixio/wei';
import { dSNXContractMainnet, dSNXContractOptimism } from 'constants/dhedge';
import Connector from 'containers/Connector';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

const useGetDSnxBalance = (queryOptions?: UseQueryOptions<Wei>) => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { provider, network } = Connector.useContainer();
	const dSNXContract = network?.name === 'mainnet' ? dSNXContractMainnet : dSNXContractOptimism;
	return useQuery(
		[walletAddress, network?.name, dSNXContract.address],
		async () => {
			if (!walletAddress) return wei(0);
			if (!provider) return wei(0);
			if (!network?.name) return wei(0);
			const balance = await dSNXContract.connect(provider!).balanceOf(walletAddress);
			return wei(balance);
		},
		{
			enabled: Boolean(walletAddress && network?.name && provider),
			...queryOptions,
		}
	);
};

export default useGetDSnxBalance;
