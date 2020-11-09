import { useQuery, QueryConfig } from 'react-query';
import { SynthetixJS } from '@synthetixio/js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { FeePoolData } from './types';

const useGetFeePoolDataQuery = (period: string, options?: QueryConfig<FeePoolData>) => {
	return useQuery<FeePoolData>(
		QUERY_KEYS.Staking.FeePoolData(period),
		async () => {
			const {
				contracts: { FeePool },
				utils: { formatEther },
			} = synthetix.js as SynthetixJS;
			const feePeriod = await FeePool.recentFeePeriods(period);
			const feePeriodDuration = await FeePool.feePeriodDuration();
			return {
				feePeriodDuration: Number(feePeriodDuration),
				startTime: Number(feePeriod.startTime) || 0,
				feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0,
				feesClaimed: Number(formatEther(feePeriod.feesClaimed)) || 0,
				rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0,
				rewardsClaimed: Number(formatEther(feePeriod.rewardsClaimed)) || 0,
			};
		},
		{
			enabled: synthetix.js && period,
			...options,
		}
	);
};

export default useGetFeePoolDataQuery;
