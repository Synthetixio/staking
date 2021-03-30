import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';
import { toBigNumber } from 'utils/formatters/number';

import QUERY_KEYS from 'constants/queryKeys';

import { appReadyState } from 'store/app';

export type FeePoolData = {
	feePeriodDuration: number;
	startTime: number;
	feesToDistribute: number;
	feesClaimed: number;
	rewardsToDistribute: number;
	rewardsToDistributeBN: BigNumber;
	rewardsClaimed: number;
};

const useGetFeePoolDataQuery = (period: string, options?: QueryConfig<FeePoolData>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<FeePoolData>(
		QUERY_KEYS.Staking.FeePoolData(period),
		async () => {
			const {
				contracts: { FeePool },
				utils: { formatEther },
			} = synthetix.js!;
			const feePeriod = await FeePool.recentFeePeriods(period);
			const feePeriodDuration = await FeePool.feePeriodDuration();
			return {
				feePeriodDuration: Number(feePeriodDuration),
				startTime: Number(feePeriod.startTime) || 0,
				feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0,
				feesClaimed: Number(formatEther(feePeriod.feesClaimed)) || 0,
				rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0,
				rewardsToDistributeBN: toBigNumber(formatEther(feePeriod.rewardsToDistribute)),
				rewardsClaimed: Number(formatEther(feePeriod.rewardsClaimed)) || 0,
			};
		},
		{
			enabled: isAppReady && period,
			...options,
		}
	);
};

export default useGetFeePoolDataQuery;
