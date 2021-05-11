import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';

import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

import QUERY_KEYS from 'constants/queryKeys';

import { appReadyState } from 'store/app';

export type FeePoolData = {
	feePeriodDuration: BN;
	startTime: BN;
	feesToDistribute: BN;
	feesClaimed: BN;
	rewardsToDistribute: BN;
	rewardsToDistributeBN: BN;
	rewardsClaimed: BN;
};

const useGetFeePoolDataQuery = (period: string, options?: QueryConfig<FeePoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<FeePoolData>(
		QUERY_KEYS.Staking.FeePoolData(period),
		async () => {
			const {
				contracts: { FeePool },
			} = synthetix.js!;
			const feePeriod = await FeePool.recentFeePeriods(period);
			const feePeriodDuration = await FeePool.feePeriodDuration();
			return {
				feePeriodDuration: toBigNumber(feePeriodDuration),
				startTime: toBigNumber(feePeriod.startTime),
				feesToDistribute: toBigNumber(feePeriod.feesToDistribute),
				feesClaimed: toBigNumber(feePeriod.feesClaimed),
				rewardsToDistribute: toBigNumber(feePeriod.rewardsToDistribute),
				rewardsToDistributeBN: toBigNumber(feePeriod.rewardsToDistribute),
				rewardsClaimed: toBigNumber(feePeriod.rewardsClaimed),
			};
		},
		{
			enabled: isAppReady && period,
			...options,
		}
	);
};

export default useGetFeePoolDataQuery;
