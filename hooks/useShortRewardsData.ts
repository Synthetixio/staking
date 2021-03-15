import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useIBTCShortsQuery from 'queries/shorts/useIBTCShortsQuery';

type LPData = {
	[name: string]: {
		APR: number;
		TVL: number;
		data: any | undefined;
	};
};

const useShortRewardsData = (): LPData => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;
	const useiBTCRewards = useIBTCShortsQuery();

	const weeklyStats = 8000;
	const weeksInAYear = 52;

	const iBTCTVL = (useiBTCRewards.data?.balance ?? 0) * (useiBTCRewards.data?.price ?? 0);

	const iBTCAPR = (weeklyStats * SNXRate * 100 * weeksInAYear) / useiBTCRewards.data?.openInterest;

	return {
		[Synths.iBTC]: {
			APR: iBTCAPR,
			TVL: iBTCTVL,
			data: useiBTCRewards.data,
		},
	};
};

export default useShortRewardsData;
