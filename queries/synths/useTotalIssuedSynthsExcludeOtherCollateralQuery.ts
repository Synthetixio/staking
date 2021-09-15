import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';

const useTotalIssuedSynthsExcludeOtherCollateralQuery = (
	currencyKey: string,
	block?: number | null,
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

			const totalIssuedSynthsExcludeOtherCollateral = await Synthetix.totalIssuedSynthsExcludeOtherCollateral(
				utils.formatBytes32String(currencyKey),
				{
					blockTag: block ? block : 'latest',
				}
			);

			return Number(utils.formatEther(totalIssuedSynthsExcludeOtherCollateral));
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useTotalIssuedSynthsExcludeOtherCollateralQuery;
