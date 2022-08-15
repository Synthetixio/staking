import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import useSynthetixQueries from '@synthetixio/queries';
import { ShortRewardsData } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

type SRData = {
  [name: string]: {
    APR: Wei;
    OI: Wei;
    data: ShortRewardsData | undefined;
  };
};

const useShortRewardsData = (walletAddress: string | null): SRData => {
  const { useExchangeRatesQuery, useShortsQuery } = useSynthetixQueries();
  const exchangeRatesQuery = useExchangeRatesQuery();
  const SNXRate = exchangeRatesQuery.data?.SNX ?? wei(0);
  const usesBTCRewards = useShortsQuery('sBTC', walletAddress);
  const usesETHRewards = useShortsQuery('sETH', walletAddress);

  const sBTCOpenInterestUSD = usesBTCRewards.data?.openInterestUSD ?? wei(0);

  const sBTCAPR =
    usesBTCRewards.data?.distribution && SNXRate && sBTCOpenInterestUSD
      ? usesBTCRewards.data.distribution.mul(SNXRate).div(sBTCOpenInterestUSD).mul(WEEKS_IN_YEAR)
      : wei(0);

  const sETHOpenInterestUSD = usesETHRewards.data?.openInterestUSD ?? wei(0);

  const sETHAPR =
    usesETHRewards.data?.distribution && SNXRate && sETHOpenInterestUSD
      ? usesETHRewards.data.distribution.mul(SNXRate).div(sETHOpenInterestUSD).mul(WEEKS_IN_YEAR)
      : wei(0);

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
