import { SynthetixProvider } from '@synthetixio/providers';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';
import { useRecoilState } from 'recoil';
import { networkState } from 'store/wallet';

const useQuery = () => {
	const { provider } = Connector.useContainer();
	const [network] = useRecoilState(networkState);
	return useSynthetixQueries({
		networkId: network!.id,
		provider: provider! as SynthetixProvider,
	});
};

export default useQuery;
