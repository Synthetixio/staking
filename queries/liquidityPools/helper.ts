import Wei, { wei } from '@synthetixio/wei';

import pageResults from 'lib/pageResults';

const uniswapV2SubgraphURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const CRVTokenAddress = '0xd533a949740bb3306d119cc777fa900ba034cd52';
const balancerSubgraphURL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';
const sTSLAPoolTokenAddress = '0x055db9aff4311788264798356bbf3a733ae181c6';
const DHedgeTokenAddress = '0xca1207647ff814039530d7d35df0e1dd2e91fa84';
const DHTLPTokenAddress = '0x303ffcd201831db88422b76f633458e94e05c33e';

export async function getCurveTokenPrice(): Promise<Wei> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'tokenDayDatas',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					token: `\\"${CRVTokenAddress}\\"`,
				},
			},
			properties: ['priceUSD'],
		},
		max: 1,
	})
		.then((result: any) => {
			return wei(result[0].priceUSD);
		})
		.catch((e: any) => {
			throw Error(e);
		});
}

export async function getsTSLABalancerPool(): Promise<Wei> {
	return pageResults({
		api: balancerSubgraphURL,
		query: {
			entity: 'pools',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					id: `\\"${sTSLAPoolTokenAddress}\\"`,
				},
			},
			properties: ['id', 'liquidity', 'totalShares'],
		},
		max: 1,
		// @ts-ignore
	})
		.then((result: any) => {
			return wei(result[0].liquidity).div(result[0].totalShares);
		})
		.catch((e: any) => {
			throw Error(e);
		});
}

export async function getBalancerPool(poolTokenAddress: string): Promise<Wei> {
	return pageResults({
		api: balancerSubgraphURL,
		query: {
			entity: 'pools',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					id: `\\"${poolTokenAddress.toLowerCase()}\\"`,
				},
			},
			properties: ['id', 'liquidity', 'totalShares'],
		},
		max: 1,
		// @ts-ignore
	})
		.then((result: any) => {
			return wei(result[0].liquidity).div(result[0].totalShares);
		})
		.catch((e: any) => {
			throw Error(e);
		});
}

export async function getDHTPrice(): Promise<Wei> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'tokenDayDatas',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					token: `\\"${DHedgeTokenAddress}\\"`,
				},
			},
			properties: ['priceUSD'],
		},
		max: 1,
	})
		.then((result: any) => {
			return wei(result[0].priceUSD);
		})
		.catch((e: any) => {
			throw Error(e);
		});
}

export async function getUniswapPairLiquidity(): Promise<Wei> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'pairs',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					id: `\\"${DHTLPTokenAddress}\\"`,
				},
			},
			properties: ['reserveUSD'],
		},
		max: 1,
	})
		.then((result: any) => {
			return wei(result[0].reserveUSD);
		})
		.catch((e: any) => {
			throw Error(e);
		});
}
