import { QueryConfig, useQuery } from 'react-query';
import { SynthetixJS } from '@synthetixio/js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';

const useSNXTotalSupply = (options?: QueryConfig<number>) => {
	return useQuery<number>(
		QUERY_KEYS.Network.SNXTotalSupply,
		async () => {
			const {
				contracts: { Synthetix },
				utils,
			} = synthetix.js as SynthetixJS;
			const totalSupply = Number(utils.formatEther(await Synthetix.totalSupply()));
			return totalSupply;
		},
		{
			enabled: synthetix.js,
			...options,
		}
	);
};

export default useSNXTotalSupply;
