import { pageResults } from 'synthetix-data';

const uniswapV2SubgraphURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const CRVTokenAddress = '0xd533a949740bb3306d119cc777fa900ba034cd52';

export async function getCurveTokenPrice(): Promise<number> {
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
		// @ts-ignore
	}).then((result) => {
		return Number(result[0].priceUSD);
	});
}
