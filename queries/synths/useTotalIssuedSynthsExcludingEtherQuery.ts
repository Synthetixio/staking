import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';

const useTotalIssuedSynthsExcludingEtherQuery = (
	currencyKey: string,
	options?: QueryConfig<number>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<number>(
		QUERY_KEYS.Synths.TotalIssuedSynths,
		async () => {
			const {
				contracts: { Synthetix },
				utils,
			} = synthetix.js!;
			const totalIssuedSynthsExclEther = await Synthetix.totalIssuedSynthsExcludeEtherCollateral(
				utils.formatBytes32String(currencyKey)
			);

			return Number(utils.formatEther(totalIssuedSynthsExclEther));
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useTotalIssuedSynthsExcludingEtherQuery;
