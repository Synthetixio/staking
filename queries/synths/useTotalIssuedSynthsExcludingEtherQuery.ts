import { useQuery, QueryConfig } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { SynthetixJS } from '@synthetixio/js';
import synthetix from 'lib/synthetix';

const useTotalIssuedSynthsExcludingEtherQuery = (
	currencyKey: string,
	options?: QueryConfig<number>
) => {
	return useQuery<number>(
		QUERY_KEYS.Synths.TotalIssuedSynths,
		async () => {
			const {
				contracts: { Synthetix },
				utils,
			} = synthetix.js as SynthetixJS;
			const totalIssuedSynthsExclEther = await Synthetix.totalIssuedSynthsExcludeEtherCollateral(
				utils.formatBytes32String(currencyKey)
			);

			return Number(utils.formatEther(totalIssuedSynthsExclEther));
		},
		{
			enabled: synthetix.js,
			...options,
		}
	);
};

export default useTotalIssuedSynthsExcludingEtherQuery;
