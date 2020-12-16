import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurvePoolQuery_1 from 'queries/liquidityPools/useCurvePoolQuery_1';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

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
	const useCurvePool = useCurvePoolQuery_1();
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
		useCurvePool.data?.swapAPY &&
		useCurvePool.data?.rewardsAPY
			? ((useCurvePool.data.distribution * SNXRate) / curveTVL) * WEEKS_IN_YEAR +
			  useCurvePool.data?.swapAPY +
			  useCurvePool.data?.rewardsAPY
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
	};
};

export default useLPData;
