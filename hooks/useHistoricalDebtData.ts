import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import type { PartialBy } from '../utils/ts-helpers';

export type HistoricalDebtAndIssuanceData = {
  timestamp: number;
  actualDebt: Wei;
  issuanceDebt: Wei;
  index: number;
};

type HistoricalDebtAndIssuance = {
  isLoading: boolean;
  data: HistoricalDebtAndIssuanceData[] | [];
};

const useHistoricalDebtData = (walletAddress: string | null): HistoricalDebtAndIssuance => {
  const { useGetDebtDataQuery, subgraph } = useSynthetixQueries();

  const issues = subgraph.useGetIssueds(
    {
      first: 1000,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      where: { account: walletAddress?.toLowerCase() },
    },
    { timestamp: true, value: true }
  );
  const burns = subgraph.useGetBurneds(
    {
      first: 1000,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      where: { account: walletAddress?.toLowerCase() },
    },
    { timestamp: true, value: true }
  );

  const debtSnapshotQuery = subgraph.useGetDebtSnapshots(
    {
      first: 1000,
      orderBy: 'timestamp',
      orderDirection: 'asc',
      where: { account: walletAddress?.toLowerCase() },
    },
    { timestamp: true, debtBalanceOf: true }
  );

  const debtDataQuery = useGetDebtDataQuery(walletAddress);

  const isLoaded =
    issues.isSuccess && burns.isSuccess && debtSnapshotQuery.isSuccess && debtDataQuery.isSuccess;

  if (!isLoaded) {
    return { isLoading: true, data: [] };
  }
  const issueData = issues.data ?? [];
  const burnData = burns.data ?? [];
  const issuesWithFlag = issueData.map((x) => ({
    ...x,
    isBurn: false,
    timestamp: x.timestamp.toNumber(),
  }));
  const burnWithFlag = burnData.map((x) => ({
    ...x,
    isBurn: true,
    timestamp: x.timestamp.toNumber(),
  }));
  const issuesAndBurns = issuesWithFlag
    .concat(burnWithFlag)
    .sort((a, b) => a.timestamp - b.timestamp);

  type PartialHistoricalDebtAndIssuanceData = PartialBy<
    HistoricalDebtAndIssuanceData,
    'actualDebt' | 'issuanceDebt' | 'index'
  >;

  // Here we create an array to store all the cumulative values of every mint and burns.
  // The "actualDebt" field will be set to undefined and later added from the debtSnapshots
  const historicalIssuanceAggregation = issuesAndBurns.reduce(
    (acc: PartialHistoricalDebtAndIssuanceData[], event) => {
      const multiplier = event.isBurn ? -1 : 1;
      const aggregation = event.value.mul(multiplier).add(acc.at(-1)?.issuanceDebt ?? wei(0));

      acc.push({
        issuanceDebt: aggregation,
        actualDebt: undefined,
        timestamp: event.timestamp * 1000,
      });
      return acc;
    },
    []
  );
  // Here we just format the debtSnapshot to match PartialHistoricalDebtAndIssuanceData[]
  const debtSnapshots = debtSnapshotQuery.data.map((debtSnapshot) => {
    const debtSnapshotTimestamp = debtSnapshot.timestamp.toNumber() * 1000;
    return {
      timestamp: debtSnapshotTimestamp,
      issuanceDebt: undefined,
      actualDebt: wei(debtSnapshot.debtBalanceOf ?? 0),
    };
  });
  // Finally we merge our two dataset together. If one of the debt field (actualDebt|issuanceDebt) is missing we use the previous one.
  // The reason for this is:
  // Say the debt snapshot was made on a tuesday. User burn on a wednesday, in this case we want the actualDebt to display the value from tuesday.
  // And vice vera:
  // If there was a debt snapshot on tuesday we want the issued debt to display whatever it was at the last time user minted or burned
  const data = historicalIssuanceAggregation
    .concat(debtSnapshots)
    .sort((a, b) => a.timestamp - b.timestamp)
    .reduce((acc: PartialHistoricalDebtAndIssuanceData[], val) => {
      const prev = acc.at(-1);
      acc.push({
        timestamp: val.timestamp,
        actualDebt: val.actualDebt || prev?.actualDebt,
        issuanceDebt: val.issuanceDebt || prev?.issuanceDebt,
      });

      return acc;
    }, []);

  // This transformation ensure that we have both actual debt and issued debt.
  // It also adds the index field making the data fulfill HistoricalDebtAndIssuanceData type signature
  const filtered = data.reduce((acc: HistoricalDebtAndIssuanceData[], val) => {
    if (!val.actualDebt || !val.issuanceDebt || !val.timestamp) return acc;
    const prev = acc.at(-1);
    acc.push({
      actualDebt: val.actualDebt,
      issuanceDebt: val.issuanceDebt,
      timestamp: val.timestamp,
      index: prev?.index ? prev.index + 1 : 0,
    });
    return acc;
  }, []);

  return { isLoading: false, data: filtered };
};

export default useHistoricalDebtData;
