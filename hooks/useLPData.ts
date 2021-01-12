import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurveSusdPoolQuery from 'queries/liquidityPools/useCurveSusdPoolQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useCurveSeuroPoolQuery from 'queries/liquidityPools/useCurveSeuroPoolQuery';

import { CryptoCurrency, Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import { LiquidityPoolData } from 'queries/liquidityPools/types';

type LPData = {
	[name: string]: {
		APR: number;
		TVL: number;
		data: LiquidityPoolData | undefined;
	};
};

const useLPData = (): LPData => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;
	const useiETHPool = useIETHPoolQuery_1();
	const useiBTCPool = useIBTCPoolQuery_1();
	const useCurvePool = useCurveSusdPoolQuery();
	const usesEuroPool = useCurveSeuroPoolQuery();

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

	const curveTVL = (useCurvePool.data?.balance ?? 0) * (useCurvePool.data?.price ?? 0);
	const curveAPR =
		useCurvePool.data?.distribution &&
		SNXRate &&
		curveTVL &&
		useCurvePool.data?.swapAPR &&
		useCurvePool.data?.rewardsAPR
			? ((useCurvePool.data.distribution * SNXRate) / curveTVL) * WEEKS_IN_YEAR +
			  useCurvePool.data?.swapAPR +
			  useCurvePool.data?.rewardsAPR
			: 0;

	const sEuroTVL = (usesEuroPool.data?.balance ?? 0) * (usesEuroPool.data?.price ?? 0);
	const sEuroAPR =
		usesEuroPool.data?.distribution &&
		SNXRate &&
		sEuroTVL &&
		usesEuroPool.data?.swapAPR &&
		usesEuroPool.data?.rewardsAPR
			? ((usesEuroPool.data.distribution * SNXRate) / curveTVL) * WEEKS_IN_YEAR +
			  usesEuroPool.data?.swapAPR +
			  usesEuroPool.data?.rewardsAPR
			: 0;

	return {
		[CryptoCurrency.CurveLPToken]: {
			APR: curveAPR,
			TVL: curveTVL,
			data: useCurvePool.data,
		},
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
		[Synths.sEUR]: {
			APR: sEuroAPR,
			TVL: sEuroTVL,
			data: usesEuroPool.data,
		},
	};
};

export default useLPData;
