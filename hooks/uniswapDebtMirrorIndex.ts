import Connector from 'containers/Connector';
import { useQuery } from 'react-query';
import { getSUSDdSNXPool } from '../constants/uniswap';

function useUniswapSUSDdSNXPool() {
	const { provider } = Connector.useContainer();
	return useQuery(['uniswapPool', 'sUSD-dSNX'], async () => getSUSDdSNXPool(provider!), {
		refetchInterval: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}

export default useUniswapSUSDdSNXPool;
