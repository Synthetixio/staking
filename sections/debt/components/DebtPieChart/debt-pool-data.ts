import { useQuery } from 'react-query';
import colors from 'styles/theme/colors';

const MUTED_COLORS = [
  colors.mutedBlue,
  colors.mutedOrange,
  colors.mutedGreen,
  colors.mutedPink,
  colors.mutedYellow,
  colors.mutedPurple,
  colors.mutedGray,
  colors.mutedRed,
  colors.mutedFoamGreen,
  colors.mutedBurntOrange,
  colors.mutedForestGreen,
];
const BRIGHT_COLORS = [
  colors.blue,
  colors.orange,
  colors.green,
  colors.pink,
  colors.yellow,
  colors.purple,
  colors.gray,
  colors.red,
  colors.foamGreen,
  colors.burntOrange,
  colors.forestGreen,
];

export type SpreadsheetData = {
  cap: string;
  currencyKey: string;
  debt_in_percent: string;
  debt_in_usd: string;
  eth_wrapper_ccy_legacy: string;
  futures_debt_usd: string;
  futures_skew_ccy: string;
  loans_ccy: string;
  position_in_ccy: string;
  position_in_usd: string;
  position_type: string;
  price: string;
  shorts_ccy: string;
  supply: string;
  timestamp: string;
  user_debt_hedge_in_ccy: string;
  user_debt_hedge_in_usd: string;
  user_debt_hedge_with_correlation_in_usd: string;
  wrappers_ccy: string;
}[];
const formatDebtPoolData = (spreadsheetData: SpreadsheetData) => {
  return spreadsheetData.map((x, i) => ({
    name: x.currencyKey,
    totalSupply: parseFloat(x.supply),
    poolProportion: parseFloat(x.debt_in_percent) / 100,
    value: parseFloat(x.price),
    skewValue: parseFloat(x.debt_in_usd),
    skewValueChart: Math.abs(parseFloat(x.debt_in_usd)),
    userDebtHedgeWithCorrelationInUsd: parseFloat(x.user_debt_hedge_with_correlation_in_usd),
    fillColor: MUTED_COLORS[i % MUTED_COLORS.length],
    strokeColor: BRIGHT_COLORS[i % BRIGHT_COLORS.length],
  }));
};

// This data is used as a workaround until our subgraphs issues are resoloved
const DEBT_DATA_URL = 'https://api.synthetix.io/debt-pool-comp';
const synthDataSortFn = (a: any, b: any) => {
  if (typeof a.poolProportion === 'number') return a.poolProportion < b.poolProportion ? 1 : -1;
  return a.poolProportion.lt(b.poolProportion) ? 1 : -1;
};
export const useGetDebtPoolData = () => {
  return useQuery('debt-pool-data', () => {
    return fetch(DEBT_DATA_URL)
      .then((x) => x.json())
      .then(formatDebtPoolData)
      .then((x) => x.filter((x) => x.name !== 'total_excluding_sUSD').sort(synthDataSortFn));
  });
};
