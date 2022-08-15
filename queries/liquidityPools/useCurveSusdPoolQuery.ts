import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import axios from 'axios';

import Connector from 'containers/Connector';
import {
  curveSusdPoolToken,
  curveSusdRewards,
  curveSusdGauge,
  curveSusdPool,
  curveGaugeController,
} from 'contracts';
import QUERY_KEYS from 'constants/queryKeys';

import Wei, { wei } from '@synthetixio/wei';
import { getCurveTokenPrice } from './helper';

export type CurveData = {
  APR: Wei;
  TVL: Wei;
  data?: { duration: number; periodFinish: number; staked: Wei; rewards: Wei };
};

const curveApiUrls = {
  mainnet: {
    mainPoolsGaugeRewards: 'https://api.curve.fi/api/getMainPoolsGaugeRewards',
    baseApys: 'https://api.curve.fi/api/getApys',
  },
  optimism: {
    gaugeApys: 'https://api.curve.fi/api/getFactoGaugesCrvRewards/optimism',
    baseApys: 'https://api.curve.fi/api/getFactoryAPYs-optimism',
    poolData: 'https://api.curve.fi/api/getFactoryV2Pools-optimism',
  },
} as const;

const calculateCRVAPYMainnet = (
  curvePrice: Wei,
  inflationRate: Wei,
  relativeWeight: Wei,
  workingSupply: Wei,
  curveSusdVirtualPrice: Wei
) => {
  const SECONDS_IN_A_YEAR = 31536000;
  /**
   * CRV rewards can be different depending on how long you lock your CRV. Without with this multiplier the calculation would assume max lock time / max rewards.
   * Applying 40% will target the lower range.
   * It's also worth noting that the calculation differ slightly compared to curve.fi UI.
   * At the time of writing this our calc gives back 2.79% whereas their UI says it 2.65%
   */
  const multiplierForLowerRangeCRVRewards = 0.4;
  const curveAPY = inflationRate
    .mul(relativeWeight)
    .mul(SECONDS_IN_A_YEAR)
    .div(workingSupply)
    .mul(multiplierForLowerRangeCRVRewards)
    .div(curveSusdVirtualPrice)
    .mul(curvePrice)
    .mul(100) // convert decimal to percent
    .toNumber();
  return curveAPY;
};
const fetchMainnetData = async (walletAddress: string, provider: ethers.providers.Provider) => {
  const curveSusdRewardsContract = new ethers.Contract(
    curveSusdRewards.address,
    curveSusdRewards.abi,
    provider
  );
  const curveSusdPoolContract = new ethers.Contract(
    curveSusdPool.address,
    // @ts-ignore
    curveSusdPool.abi,
    provider as ethers.providers.Provider
  );
  const curveSusdPoolTokenContract = new ethers.Contract(
    curveSusdPoolToken.address,
    curveSusdPoolToken.abi,
    provider
  );
  const curveSusdGaugeContract = new ethers.Contract(
    curveSusdGauge.address,
    // @ts-ignore
    curveSusdGauge.abi,
    provider
  );
  const curveGaugeControllerContract = new ethers.Contract(
    curveGaugeController.address,
    // @ts-ignore
    curveGaugeController.abi,
    provider
  );
  const POOL_NAME = 'susdv2';
  try {
    const mainPoolGaugeP = axios.get<{
      data: { mainPoolsGaugeRewards: { [address: string]: { apy: number }[] } };
    }>(curveApiUrls.mainnet.mainPoolsGaugeRewards);
    const baseAPYP = axios.get<{ data: { susdv2: { baseApy: string } } }>(
      curveApiUrls.mainnet.baseApys
    );

    const apiPromises = Promise.all([mainPoolGaugeP, baseAPYP]);
    const contractPromises = Promise.all([
      getCurveTokenPrice(),
      curveSusdRewardsContract.DURATION(),
      curveSusdRewardsContract.periodFinish(),
      curveSusdGaugeContract.inflation_rate({ gasLimit: 1e5 }),
      curveSusdGaugeContract.working_supply({ gasLimit: 1e5 }),
      curveGaugeControllerContract.gauge_relative_weight(curveSusdGauge.address),
      curveSusdPoolContract.get_virtual_price(),
      curveSusdPoolTokenContract.balanceOf(curveSusdRewardsContract.address),
      curveSusdGaugeContract.balanceOf(walletAddress),
      curveSusdRewardsContract.earned(walletAddress),
    ]);

    const [
      [mainPoolGauge, baseAPY],
      [
        curvePrice,
        duration,
        periodFinish,
        inflationRate,
        workingSupply,
        relativeWeight,
        curveSusdVirtualPrice,
        tvl,
        staked,
        rewards,
      ],
    ] = await Promise.all([apiPromises, contractPromises]);

    const snxApy =
      mainPoolGauge.data.data.mainPoolsGaugeRewards?.[curveSusdGauge.address.toLowerCase()][0]?.apy;
    const baseApy = baseAPY.data.data?.[POOL_NAME]?.baseApy;

    const curveAPY = calculateCRVAPYMainnet(
      curvePrice,
      wei(inflationRate),
      wei(relativeWeight),
      wei(workingSupply),
      wei(curveSusdVirtualPrice)
    );

    if (snxApy === undefined || baseApy === undefined || curveAPY === undefined) return undefined;
    return {
      apy: Number(baseApy) + Number(snxApy) + Number(curveAPY),
      tvl: wei(tvl).mul(curveSusdVirtualPrice).toNumber(),
      data: {
        periodFinish: Number(periodFinish) * 1000,
        duration: Number(duration) * 1000,
        staked: wei(staked),
        rewards: wei(rewards),
      },
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

const CURVE_SUSD_POOL_ADDRESS_OPTIMISM = '0x061b87122ed14b9526a813209c8a59a633257bab';
const fetchOptimismData = async () => {
  try {
    const CRVDataP = axios.get<{
      data: { sideChainGaugesApys: { address: string; apy: string }[] };
    }>(curveApiUrls.optimism.gaugeApys);
    const baseAPYP = axios.get<{ data: { poolDetails: { poolAddress: string; apy: string }[] } }>(
      curveApiUrls.optimism.baseApys
    );
    const poolDataP = axios.get<{ data: { poolData: { address: string; usdTotal: number }[] } }>(
      curveApiUrls.optimism.poolData
    );

    const [CRVData, baseAPY, poolData] = await Promise.all([CRVDataP, baseAPYP, poolDataP]);

    const poolDatum = poolData.data.data.poolData.find(
      (x) => x.address.toLowerCase() === CURVE_SUSD_POOL_ADDRESS_OPTIMISM
    );
    const crvAPY = CRVData.data.data.sideChainGaugesApys.find(
      (x) => x.address.toLowerCase() === CURVE_SUSD_POOL_ADDRESS_OPTIMISM
    );

    const poolDetails = baseAPY.data.data.poolDetails.find(
      (x) => x.poolAddress.toLowerCase() === CURVE_SUSD_POOL_ADDRESS_OPTIMISM
    );
    const tvl = poolDatum?.usdTotal;
    if (crvAPY?.apy === undefined || poolDetails?.apy === undefined || tvl === undefined) {
      return undefined;
    }
    return {
      apy: parseFloat(crvAPY.apy) + parseFloat(poolDetails.apy),
      tvl: tvl,
      data: undefined,
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

const useCurveSusdPoolQuery = (options?: UseQueryOptions<CurveData | undefined>) => {
  const { provider, isAppReady, isWalletConnected, walletAddress, network, isMainnet } =
    Connector.useContainer();

  return useQuery<CurveData | undefined>(
    QUERY_KEYS.LiquidityPools.sUSD(walletAddress ?? '', network?.id!),
    async () => {
      const fetchData = isMainnet ? fetchMainnetData : fetchOptimismData;

      const { tvl, apy, data } = (await fetchData(walletAddress!, provider!)) || {};

      if (!apy || !tvl) return undefined;

      return {
        TVL: wei(tvl),
        APR: wei(apy / 100),
        data,
      };
    },
    {
      enabled: isAppReady && isWalletConnected && provider != null && Boolean(walletAddress),
      ...options,
    }
  );
};

export default useCurveSusdPoolQuery;
