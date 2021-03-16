import { pageResults } from 'synthetix-data';

const synthetixSnx = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix';

export const getHolders = async () =>
	pageResults({
		api: synthetixSnx,
		query: {
			entity: 'snxholders',
			selection: {
				orderBy: 'collateral',
				orderDirection: 'desc',
				where: {
					block_gt: 5873222,
				},
			},
			properties: ['collateral', 'debtEntryAtIndex', 'initialDebtOwnership'],
		},
		max: 1000,
	});
