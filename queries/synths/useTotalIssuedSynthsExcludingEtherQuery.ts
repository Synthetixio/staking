import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';
import { toBigNumber } from 'utils/formatters/number';

const useTotalIssuedSynthsExcludingEtherQuery = (
	currencyKey: string,
	block?: number | null,
	options?: QueryConfig<BN>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<BN>(
		QUERY_KEYS.Synths.TotalIssuedSynths,
		async () => {
			const {
				contracts: { Synthetix },
				utils,
			} = synthetix.js!;

			const totalIssuedSynthsExclEther = await Synthetix.totalIssuedSynthsExcludeEtherCollateral(
				utils.formatBytes32String(currencyKey),
				{
					blockTag: block ? block : 'latest',
				}
			);

			return toBigNumber(totalIssuedSynthsExclEther);
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useTotalIssuedSynthsExcludingEtherQuery;
