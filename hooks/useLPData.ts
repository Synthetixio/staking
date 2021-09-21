import useCurveSusdPoolQuery from 'queries/liquidityPools/useCurveSusdPoolQuery';
import useYearnSNXVaultQuery, {
	YearnVaultData,
} from 'queries/liquidityPools/useYearnSNXVaultQuery';

import { WEEKS_IN_YEAR } from 'constants/date';
import { DualRewardsLiquidityPoolData, LiquidityPoolData } from 'queries/liquidityPools/types';
import { LP } from 'sections/earn/types';

import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

type LPData = {
	[name: string]: {
		APR: Wei;
		TVL: Wei;
		data: LiquidityPoolData | DualRewardsLiquidityPoolData | YearnVaultData | undefined;
	};
};

const useLPData = (): LPData => {
	const { useExchangeRatesQuery } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;
	const usesUSDPool = useCurveSusdPoolQuery();
	const usesYearnSNXVault = useYearnSNXVaultQuery();

	const sUsdTVL = usesUSDPool.isSuccess
		? usesUSDPool.data!.balance.mul(usesUSDPool.data!.price)
		: wei(0);
	const sUsdAPR =
		usesUSDPool.data?.distribution &&
		SNXRate &&
		sUsdTVL.gt(0) &&
		usesUSDPool.data?.swapAPR &&
		usesUSDPool.data?.rewardsAPR
			? usesUSDPool.data.distribution
					.mul(SNXRate)
					.div(sUsdTVL)
					.mul(WEEKS_IN_YEAR)
					.add(usesUSDPool.data?.swapAPR)
					.add(usesUSDPool.data?.rewardsAPR)
			: wei(0);

	const yearnSNXVaultAPY = usesYearnSNXVault.data?.apy ?? wei(0);
	const yearnSNXVaultTVL = usesYearnSNXVault.data?.tvl ?? wei(0);

	return {
		[LP.CURVE_sUSD]: {
			APR: sUsdAPR,
			TVL: sUsdTVL,
			data: usesUSDPool.data,
		},
		[LP.YEARN_SNX_VAULT]: {
			APR: yearnSNXVaultAPY,
			TVL: yearnSNXVaultTVL,
			data: usesYearnSNXVault.data,
		},
	};
};

export default useLPData;
