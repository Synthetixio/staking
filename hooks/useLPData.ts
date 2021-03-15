import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurveSusdPoolQuery from 'queries/liquidityPools/useCurveSusdPoolQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useCurveSeuroPoolQuery from 'queries/liquidityPools/useCurveSeuroPoolQuery';
import useTSLAPoolQuery from 'queries/liquidityPools/useTSLAPoolQuery';

import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import { DualRewardsLiquidityPoolData, LiquidityPoolData } from 'queries/liquidityPools/types';
import { LP } from 'sections/earn/types';
import useDHTsUSDPoolQuery from 'queries/liquidityPools/useDHTsUDPoolQuery';

type LPData = {
	[name: string]: {
		APR: number;
		TVL: number;
		data: LiquidityPoolData | DualRewardsLiquidityPoolData | undefined;
	};
};

const useLPData = (): LPData => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;
	const useiETHPool = useIETHPoolQuery_1();
	const useiBTCPool = useIBTCPoolQuery_1();
	const usesUSDPool = useCurveSusdPoolQuery();
	const usesEuroPool = useCurveSeuroPoolQuery();
	const usesTSLAPool = useTSLAPoolQuery();
	const usesDHTPool = useDHTsUSDPoolQuery();

	const iETHTVL = (useiETHPool.data?.balance ?? 0) * (useiETHPool.data?.price ?? 0);
	const iETHAPR =
		useiETHPool.data?.distribution && SNXRate && iETHTVL
			? ((useiETHPool.data.distribution * SNXRate) / iETHTVL) * WEEKS_IN_YEAR
			: 0;

	const iBTCTVL = (useiBTCPool.data?.balance ?? 0) * (useiBTCPool.data?.price ?? 0);
	const iBTCAPR =
		useiBTCPool.data?.distribution && SNXRate && iBTCTVL
			? ((useiBTCPool.data.distribution * SNXRate) / iBTCTVL) * WEEKS_IN_YEAR
			: 0;

	const sTSLATVL = (usesTSLAPool.data?.balance ?? 0) * (usesTSLAPool.data?.price ?? 0);
	const sTSLAAPR =
		usesTSLAPool.data?.distribution && SNXRate && sTSLATVL
			? ((usesTSLAPool.data.distribution * SNXRate) / sTSLATVL) * WEEKS_IN_YEAR
			: 0;

	const DHTRate = usesDHTPool.data?.price;
	const DHTTVL = usesDHTPool.data?.liquidity ?? 0;
	const DHTAPR =
		usesDHTPool.data?.distribution.a &&
		usesDHTPool.data?.distribution.b &&
		SNXRate &&
		DHTRate &&
		DHTTVL
			? ((usesDHTPool.data.distribution.a * SNXRate) / DHTTVL) * WEEKS_IN_YEAR +
			  ((usesDHTPool.data.distribution.b * DHTRate) / DHTTVL) * WEEKS_IN_YEAR
			: 0;

	const sUsdTVL = (usesUSDPool.data?.balance ?? 0) * (usesUSDPool.data?.price ?? 0);
	const sUsdAPR =
		usesUSDPool.data?.distribution &&
		SNXRate &&
		sUsdTVL &&
		usesUSDPool.data?.swapAPR &&
		usesUSDPool.data?.rewardsAPR
			? ((usesUSDPool.data.distribution * SNXRate) / sUsdTVL) * WEEKS_IN_YEAR +
			  usesUSDPool.data?.swapAPR +
			  usesUSDPool.data?.rewardsAPR
			: 0;

	const sEuroTVL = (usesEuroPool.data?.balance ?? 0) * (usesEuroPool.data?.price ?? 0);
	const sEuroAPR =
		usesEuroPool.data?.distribution &&
		SNXRate &&
		sEuroTVL &&
		usesEuroPool.data?.swapAPR &&
		usesEuroPool.data?.rewardsAPR
			? ((usesEuroPool.data.distribution * SNXRate) / sUsdTVL) * WEEKS_IN_YEAR +
			  usesEuroPool.data?.swapAPR +
			  usesEuroPool.data?.rewardsAPR
			: 0;

	return {
		[Synths.iETH]: {
			APR: iETHAPR,
			TVL: iETHTVL,
			data: useiETHPool.data,
		},
		[Synths.iBTC]: {
			APR: iBTCAPR,
			TVL: iBTCTVL,
			data: useiBTCPool.data,
		},
		[LP.CURVE_sEURO]: {
			APR: sEuroAPR,
			TVL: sEuroTVL,
			data: usesEuroPool.data,
		},
		[LP.CURVE_sUSD]: {
			APR: sUsdAPR,
			TVL: sUsdTVL,
			data: usesUSDPool.data,
		},
		[LP.BALANCER_sTSLA]: {
			APR: sTSLAAPR,
			TVL: sTSLATVL,
			data: usesTSLAPool.data,
		},
		[LP.UNISWAP_DHT]: {
			APR: DHTAPR,
			TVL: DHTTVL,
			data: usesDHTPool.data,
		},
	};
};

export default useLPData;
