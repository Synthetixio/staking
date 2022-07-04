export interface SubgraphEndpoints {
	exchanges: string;
	exchanger: string;
	issuance: string;
	subgraph: string;
}

export const DEFAULT_SUBGRAPH_ENDPOINTS: { [networkId: number]: SubgraphEndpoints } = {
	1: {
		exchanges: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-exchanges',
		exchanger: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-exchanger',
		issuance: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix',
		subgraph: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/mainnet-main',
	},

	10: {
		exchanges: 'https://api.thegraph.com/subgraphs/name/dbeal-eth/optimism-exchanges2',
		exchanger: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-exchanger',
		issuance: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-issuance',
		subgraph: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-main',
	},

	42: {
		exchanges: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/kovan-exchanges',
		exchanger: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/kovan-exchanger',
		issuance: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/kovan-issuance',
		subgraph: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/kovan-main',
	},
	69: {
		exchanges: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-kovan-exchanges',
		exchanger: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-kovan-exchanger',
		issuance: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-kovan-issuance',
		subgraph: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-kovan-main',
	},
};
