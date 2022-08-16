import { orderBy } from 'lodash';
import useSynthetixQueries from '@synthetixio/queries';
import { useQuery } from 'react-query';
import axios from 'axios';
import Wei, { wei } from '@synthetixio/wei';
import { dHedgeAPIUrl } from 'constants/dhedge';
import { dSNXPoolAddressMainnet, dSNXPoolAddressOptimism } from 'constants/dhedge';
import Connector from 'containers/Connector';

type HistoricalGlobalDebtAndIssuanceData = {
  mirrorPool: {
    value: number;
    timestamp: number;
  };
  debtPool: {
    value: number;
    timestamp: number;
  };
};

type HistoricalGlobalDebtAndIssuance = {
  isLoading: boolean;
  data: HistoricalGlobalDebtAndIssuanceData[];
};

interface DHedgePerformanceResponse {
  data: {
    performanceHistory: {
      history: {
        performance: string;
        timestamp: string;
      }[];
    };
  };
  errors: any[];
}
enum EvenBlockType {
  STAKING_TRANSACTION = 'STAKING_TRANSACTION',
  DHEDGE_ITEM = 'DHEDGE_ITEM',
}
type EventBlocks = Array<{
  type: EvenBlockType;
  timestamp: number;
  value: Wei;
}>;

const useGlobalHistoricalDebtData = (): HistoricalGlobalDebtAndIssuance => {
  const { isMainnet } = Connector.useContainer();
  const poolAddress = isMainnet ? dSNXPoolAddressMainnet : dSNXPoolAddressOptimism;
  const dHedgeData = useQuery<DHedgePerformanceResponse>(
    ['dhedge', dHedgeAPIUrl, poolAddress],
    async () => {
      const response = await axios({
        url: dHedgeAPIUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query: `{
              performanceHistory (address:"${poolAddress}", period:"1m") {
                history {
                  performance,
                  timestamp
              }
            }
          }`,
        },
      });
      return response.data;
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  const { subgraph } = useSynthetixQueries();
  const dailyIssued = subgraph.useGetDailyIssueds(
    { orderBy: 'id', orderDirection: 'desc' },
    { id: true, totalDebt: true }
  );
  const dailyBurned = subgraph.useGetDailyBurneds(
    { orderBy: 'id', orderDirection: 'desc' },
    { id: true, totalDebt: true }
  );
  const isLoaded =
    dailyIssued.isSuccess &&
    dailyBurned.isSuccess &&
    dHedgeData.isSuccess &&
    !dHedgeData.data.errors?.length &&
    dHedgeData.data;
  if (!isLoaded) {
    return { isLoading: true, data: [] };
  }

  const dhedgeHistory =
    dHedgeData.data?.data.performanceHistory.history
      .map((history) => ({
        type: EvenBlockType.DHEDGE_ITEM,
        value: wei(Number(history.performance) * 100),
        // we are getting the timestamps in milliseconds while our data is in seconds
        timestamp: Math.floor(Number(history.timestamp) / 1000),
      }))
      .filter((history) => !history.value.eq(0)) ?? [];

  const dailyIssuedData =
    dailyIssued.data?.map((x) => ({
      timestamp: Number(x.id),
      type: EvenBlockType.STAKING_TRANSACTION,
      value: x.totalDebt,
    })) ?? [];
  const dailyBurnedData =
    dailyBurned.data?.map((x) => ({
      timestamp: Number(x.id),
      type: EvenBlockType.STAKING_TRANSACTION,
      value: x.totalDebt,
    })) ?? [];

  // We concat both the events and order them (asc)
  const eventBlocks: EventBlocks = orderBy(
    dailyIssuedData.concat(dailyBurnedData).concat(dhedgeHistory),
    'timestamp',
    'asc'
  );
  const firstIndexOfDHedgeInformation =
    eventBlocks.findIndex((x) => EvenBlockType.DHEDGE_ITEM === x.type) - 1;
  const trimmedEventBlocks = eventBlocks.slice(
    firstIndexOfDHedgeInformation - 1,
    eventBlocks.length - 1
  );
  const data: HistoricalGlobalDebtAndIssuanceData[] = [];
  let lastKnownDebtPoolPrice = wei(0);
  let lastKnownPerformance = wei(0);
  trimmedEventBlocks.forEach((event) => {
    if (event.type === EvenBlockType.STAKING_TRANSACTION) {
      lastKnownDebtPoolPrice = event.value;
      data.push({
        mirrorPool: {
          value: event.value.add(lastKnownPerformance).toNumber(),
          timestamp: event.timestamp,
        },
        debtPool: { timestamp: event.timestamp, value: event.value.toNumber() },
      });
    } else if (event.type === EvenBlockType.DHEDGE_ITEM) {
      const percentageOf = lastKnownDebtPoolPrice.mul(event.value).div(100);
      lastKnownPerformance = percentageOf;
      data.push({
        mirrorPool: {
          value: lastKnownDebtPoolPrice.add(percentageOf).toNumber(),
          timestamp: event.timestamp,
        },
        debtPool: { timestamp: event.timestamp, value: lastKnownDebtPoolPrice.toNumber() },
      });
    }
  });
  return {
    isLoading: false,
    data,
  };
};

export default useGlobalHistoricalDebtData;
