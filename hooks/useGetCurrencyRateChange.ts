import useSynthetixQueries from '@synthetixio/queries';
import { calculatePercentChange } from 'utils/currencies';

const useGetCurrencyRateChange = (sinceTimestampS: number, synth: string) => {
  const { subgraph } = useSynthetixQueries();

  const snxPriceAtTimestamp = subgraph.useGetRateUpdates(
    {
      first: 1,
      where: { synth: synth, timestamp_gte: sinceTimestampS },
      orderBy: 'timestamp',
      orderDirection: 'asc',
    },
    { rate: true, timestamp: true },
    { keepPreviousData: true }
  );
  const snxPriceNow = subgraph.useGetRateUpdates(
    {
      first: 1,
      where: { synth: synth },
      orderBy: 'timestamp',
      orderDirection: 'desc',
    },
    { rate: true, timestamp: true },
    { keepPreviousData: true }
  );
  if (!snxPriceAtTimestamp.data?.[0] || !snxPriceNow.data?.[0]) return undefined;

  return calculatePercentChange(
    snxPriceAtTimestamp.data[0].rate,
    snxPriceNow.data[0].rate
  ).toNumber();
};

export default useGetCurrencyRateChange;
