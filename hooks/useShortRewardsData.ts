import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import useSynthetixQueries from '@synthetixio/queries';
import { ShortRewardsData } from '@synthetixio/queries/build/node/src/queries/shorts/types';

type SRData = {
	[name: string]: {
		APR: number;
		OI: number;
		data: ShortRewardsData | undefined;
	};
};

const useShortRewardsData = (walletAddress: string | null): SRData => {
	const { useExchangeRatesQuery, useShortsQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;
	const usesBTCRewards = useShortsQuery('sBTC', walletAddress);
	const usesETHRewards = useShortsQuery('sETH', walletAddress);

	const sBTCOpenInterestUSD = usesBTCRewards.data?.openInterestUSD ?? 0;

	const sBTCAPR =
		usesBTCRewards.data?.distribution && SNXRate && sBTCOpenInterestUSD
			? ((usesBTCRewards.data.distribution * SNXRate) / sBTCOpenInterestUSD) * WEEKS_IN_YEAR
			: 0;

	const sETHOpenInterestUSD = usesETHRewards.data?.openInterestUSD ?? 0;

	const sETHAPR =
		usesETHRewards.data?.distribution && SNXRate && sETHOpenInterestUSD
			? ((usesETHRewards.data.distribution * SNXRate) / sETHOpenInterestUSD) * WEEKS_IN_YEAR
			: 0;

	return {
		[Synths.sBTC]: {
			APR: sBTCAPR,
			OI: sBTCOpenInterestUSD,
			data: usesBTCRewards.data,
		},
		[Synths.sETH]: {
			APR: sETHAPR,
			OI: sETHOpenInterestUSD,
			data: usesETHRewards.data,
		},
	};
};

export default useShortRewardsData;
