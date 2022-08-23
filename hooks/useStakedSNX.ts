import { useQuery } from 'react-query';

const STAKED_SNX_DATA_URL = 'https://api.synthetix.io/staking-ratio';

export type StakedSNXResponse = {
  cratio: number;
  timestamp: number;
  stakedSnx: {
    ethereum: number;
    optimism: number;
  };
};
export const useStakedSNX = () => {
  return useQuery(
    'debt-pool-data',
    async () => {
      const resp = await fetch(STAKED_SNX_DATA_URL);

      const data: StakedSNXResponse = await resp.json();
      return data;
    },
    { staleTime: 10000 }
  );
};
