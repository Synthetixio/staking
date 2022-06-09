import Wei, { wei } from '@synthetixio/wei';
import { dSNXContractMainnet, dSNXPoolContractOptimism } from 'constants/dhedge';
import Connector from 'containers/Connector';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { isMainnetState, walletAddressState } from 'store/wallet';

const useGetDSnxBalance = (queryOptions?: UseQueryOptions<Wei>) => {
	const walletAddress = useRecoilValue(walletAddressState);
	const isMainnet = useRecoilValue(isMainnetState);
	const { provider, network } = Connector.useContainer();
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
