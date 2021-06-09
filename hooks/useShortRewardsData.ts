import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import { ShortRewardsData } from 'queries/shorts/types';
import useSBTCShortsQuery from 'queries/shorts/useSBTCShortsQuery';
import useSETHShortsQuery from 'queries/shorts/useSETHShortsQuery';
import useSynthetixQueries from '@synthetixio/queries';
import { NetworkId } from '@synthetixio/contracts-interface';

type SRData = {
	[name: string]: {
		APR: number;
		OI: number;
		data: ShortRewardsData | undefined;
	};
};

const useShortRewardsData = (networkId: NetworkId): SRData => {
	const { useExchangeRatesQuery } = useSynthetixQueries({ networkId });
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;
	const usesBTCRewards = useSBTCShortsQuery();
	const usesETHRewards = useSETHShortsQuery();

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
