import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurveSusdPoolQuery from 'queries/liquidityPools/useCurveSusdPoolQuery';
import useCurveSeuroPoolQuery from 'queries/liquidityPools/useCurveSeuroPoolQuery';
import useYearnSNXVaultQuery, {
	YearnVaultData,
} from 'queries/liquidityPools/useYearnSNXVaultQuery';

import { Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';
import { DualRewardsLiquidityPoolData, LiquidityPoolData } from 'queries/liquidityPools/types';
import { LP } from 'sections/earn/types';
import useDHTsUSDPoolQuery from 'queries/liquidityPools/useDHTsUDPoolQuery';
import useBalancerPoolQuery from 'queries/liquidityPools/useBalancerPoolQuery';
import {
	balancersTSLAPoolToken,
	balancersFBPoolToken,
	balancersAAPLPoolToken,
	balancersAMZNPoolToken,
	balancersNFLXPoolToken,
	balancersGOOGPoolToken,
	balancersMSFTPoolToken,
	balancersCOINPoolToken,
} from 'contracts';
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
	const useiETHPool = useIETHPoolQuery_1();
	const useiBTCPool = useIBTCPoolQuery_1();
	const usesUSDPool = useCurveSusdPoolQuery();
	const usesEuroPool = useCurveSeuroPoolQuery();
	const usesTSLAPool = useBalancerPoolQuery(
		Synths.sTSLA,
		'StakingRewardssTSLABalancer',
		balancersTSLAPoolToken
	);
	const usesFBPool = useBalancerPoolQuery(
		Synths.sFB,
		'StakingRewardssFBBalancer',
		balancersFBPoolToken
	);
	const usesAAPLPool = useBalancerPoolQuery(
		Synths.sAAPL,
		'StakingRewardssAAPLBalancer',
		balancersAAPLPoolToken
	);
	const usesAMZNPool = useBalancerPoolQuery(
		Synths.sAMZN,
		'StakingRewardssAMZNBalancer',
		balancersAMZNPoolToken
	);
	const usesNFLXPool = useBalancerPoolQuery(
		Synths.sNFLX,
		'StakingRewardssNFLXBalancer',
		balancersNFLXPoolToken
	);
	const usesGOOGPool = useBalancerPoolQuery(
		Synths.sGOOG,
		'StakingRewardssGOOGBalancer',
		balancersGOOGPoolToken
	);
	const usesMSFTPool = useBalancerPoolQuery(
		Synths.sMSFT,
		'StakingRewardssMSFTBalancer',
		balancersMSFTPoolToken
	);
	const usesCOINPool = useBalancerPoolQuery(
		Synths.sCOIN,
		'StakingRewardssCOINBalancer',
		balancersCOINPoolToken
	);
	const usesDHTPool = useDHTsUSDPoolQuery();
	const usesYearnSNXVault = useYearnSNXVaultQuery();

	const iETHTVL = useiETHPool.isSuccess
		? useiETHPool.data!.balance.mul(useiETHPool.data!.price)
		: wei(0);
	const iETHAPR =
		useiETHPool.data?.distribution && SNXRate && iETHTVL
			? useiETHPool.data.distribution.mul(SNXRate).div(iETHTVL).mul(WEEKS_IN_YEAR)
			: wei(0);

	const iBTCTVL = useiBTCPool.isSuccess
		? useiBTCPool.data!.balance.mul(useiBTCPool.data!.price)
		: wei(0);
	const iBTCAPR =
		useiBTCPool.data?.distribution && SNXRate && iBTCTVL
			? useiBTCPool.data.distribution.mul(SNXRate).div(iBTCTVL).mul(WEEKS_IN_YEAR)
			: wei(0);

	const DHTRate = usesDHTPool.data?.price;
	const DHTTVL = usesDHTPool.data?.liquidity ?? wei(0);
	const DHTAPR =
		usesDHTPool.data?.distribution.a &&
		usesDHTPool.data?.distribution.b &&
		SNXRate &&
		DHTRate &&
		DHTTVL
			? usesDHTPool.data.distribution.a
					.mul(SNXRate)
					.add(usesDHTPool.data.distribution.b.mul(DHTRate))
					.div(DHTTVL)
					.mul(WEEKS_IN_YEAR)
			: wei(0);

	const sUsdTVL = usesUSDPool.isSuccess
		? usesUSDPool.data!.balance.mul(usesUSDPool.data!.price)
		: wei(0);
	const sUsdAPR =
		usesUSDPool.data?.distribution &&
		SNXRate &&
		sUsdTVL &&
		usesUSDPool.data?.swapAPR &&
		usesUSDPool.data?.rewardsAPR
			? usesUSDPool.data.distribution
					.mul(SNXRate)
					.div(sUsdTVL)
					.mul(WEEKS_IN_YEAR)
					.add(usesUSDPool.data?.swapAPR)
					.add(usesUSDPool.data?.rewardsAPR)
			: wei(0);

	const sEuroTVL = usesEuroPool.isSuccess
		? usesEuroPool.data!.balance.mul(usesEuroPool.data!.price)
		: wei(0);
	const sEuroAPR =
		usesEuroPool.data?.distribution &&
		SNXRate &&
		sEuroTVL &&
		usesEuroPool.data?.swapAPR &&
		usesEuroPool.data?.rewardsAPR
			? usesEuroPool.data.distribution
					.mul(SNXRate)
					.div(sUsdTVL)
					.mul(WEEKS_IN_YEAR)
					.add(usesEuroPool.data?.swapAPR)
					.add(usesEuroPool.data?.rewardsAPR)
			: wei(0);

	const balancerPoolTVL = (data?: LiquidityPoolData) =>
		data != null ? data.balance.mul(data.price) : wei(0);
	const balancerPoolAPR = (data?: LiquidityPoolData) =>
		data?.distribution && SNXRate && balancerPoolTVL(data)
			? data!.distribution.mul(SNXRate).div(balancerPoolTVL(data)).mul(WEEKS_IN_YEAR)
			: wei(0);

	const yearnSNXVaultAPY = usesYearnSNXVault.data?.apy ?? wei(0);
	const yearnSNXVaultTVL = usesYearnSNXVault.data?.tvl ?? wei(0);

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
			APR: balancerPoolAPR(usesTSLAPool.data),
			TVL: balancerPoolTVL(usesTSLAPool.data),
			data: usesTSLAPool.data,
		},
		[LP.BALANCER_sFB]: {
			APR: balancerPoolAPR(usesFBPool.data),
			TVL: balancerPoolTVL(usesFBPool.data),
			data: usesFBPool.data,
		},
		[LP.BALANCER_sAAPL]: {
			APR: balancerPoolAPR(usesAAPLPool.data),
			TVL: balancerPoolTVL(usesAAPLPool.data),
			data: usesAAPLPool.data,
		},
		[LP.BALANCER_sAMZN]: {
			APR: balancerPoolAPR(usesAMZNPool.data),
			TVL: balancerPoolTVL(usesAMZNPool.data),
			data: usesAMZNPool.data,
		},
		[LP.BALANCER_sNFLX]: {
			APR: balancerPoolAPR(usesNFLXPool.data),
			TVL: balancerPoolTVL(usesNFLXPool.data),
			data: usesNFLXPool.data,
		},
		[LP.BALANCER_sGOOG]: {
			APR: balancerPoolAPR(usesGOOGPool.data),
			TVL: balancerPoolTVL(usesGOOGPool.data),
			data: usesGOOGPool.data,
		},
		[LP.BALANCER_sMSFT]: {
			APR: balancerPoolAPR(usesMSFTPool.data),
			TVL: balancerPoolTVL(usesMSFTPool.data),
			data: usesMSFTPool.data,
		},
		[LP.BALANCER_sCOIN]: {
			APR: balancerPoolAPR(usesCOINPool.data),
			TVL: balancerPoolTVL(usesCOINPool.data),
			data: usesCOINPool.data,
		},
		[LP.UNISWAP_DHT]: {
			APR: DHTAPR,
			TVL: DHTTVL,
			data: usesDHTPool.data,
		},
		[LP.YEARN_SNX_VAULT]: {
			APR: yearnSNXVaultAPY,
			TVL: yearnSNXVaultTVL,
			data: usesYearnSNXVault.data,
		},
	};
};

export default useLPData;
