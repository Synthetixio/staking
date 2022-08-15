import useCurveSusdPoolQuery, { CurveData } from 'queries/liquidityPools/useCurveSusdPoolQuery';
import useYearnSNXVaultQuery, {
  YearnVaultData,
} from 'queries/liquidityPools/useYearnSNXVaultQuery';

import { DualRewardsLiquidityPoolData, LiquidityPoolData } from 'queries/liquidityPools/types';
import { LP } from 'sections/earn/types';
import Wei, { wei } from '@synthetixio/wei';

type LPData = {
  [name: string]: {
    APR: Wei;
    TVL: Wei;
    data:
      | LiquidityPoolData
      | DualRewardsLiquidityPoolData
      | YearnVaultData
      | CurveData['data']
      | undefined;
  };
};

const useLPData = (): LPData => {
  const usesUSDPool = useCurveSusdPoolQuery();
  const usesYearnSNXVault = useYearnSNXVaultQuery();
  const curveSusdPoolAPY = usesUSDPool.data?.APR ?? wei(0);
  const curveSusdPoolTVL = usesUSDPool.data?.TVL ?? wei(0);
  const yearnSNXVaultAPY = usesYearnSNXVault.data?.apy ?? wei(0);
  const yearnSNXVaultTVL = usesYearnSNXVault.data?.tvl ?? wei(0);

  return {
    [LP.CURVE_sUSD]: {
      APR: curveSusdPoolAPY,
      TVL: curveSusdPoolTVL,
      data: usesUSDPool.data?.data,
    },
    [LP.YEARN_SNX_VAULT]: {
      APR: yearnSNXVaultAPY,
      TVL: yearnSNXVaultTVL,
      data: usesYearnSNXVault.data,
    },
  };
};

export default useLPData;
