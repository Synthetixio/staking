export const ROUTES = {
	Home: '/',
	Staking: {
		Home: '/staking',
		Burn: '/staking/burn',
		Mint: '/staking/mint',
	},
	Debt: {
		Home: '/debt',
	},
	Escrow: {
		Home: '/escrow',
		Staking: '/escrow/staking',
		ICO: '/escrow/ico',
	},
	History: {
		Home: '/history',
	},
	Synths: {
		Home: '/synths',
	},
	Earn: {
		Home: '/earn',
		Claim: '/earn/claim',
		sUSD_LP: '/earn/sUSD-LP',
		sEURO_LP: '/earn/sEURO-LP',
		iBTC_LP: '/earn/iBTC-LP',
		iETH_LP: '/earn/iETH-LP',
		sTLSA_LP: '/earn/sTSLA-LP',
		sUSD_EXTERNAL: 'https://www.curve.fi/susdv2/',
		sEURO_EXTERNAL: 'https://www.curve.fi/eurs/',
		DHT_LP: '/earn/DHT-LP',
		sBTC_EXTERNAL: 'https://kwenta.io/shorting',
		sBTC_SHORT: '/earn/sBTC-SHORT',
	},
	L2: {
		Home: '/l2',
		Deposit: '/l2/deposit',
		Migrate: '/l2/migrate',
	},
	Withdraw: {
		Home: '/withdraw',
	},
	Gov: {
		Home: '/gov',
		Space: (spaceKey: string) => `/gov/${spaceKey}`,
		Create: (spaceKey: string) => `/gov/${spaceKey}/create`,
		Proposal: (spaceKey: string, id: string) => `/gov/${spaceKey}/${id}`,
	},
	Loans: {
		Home: '/loans',
	},
	Delegate: {
		Home: '/delegate',
	},
};

export default ROUTES;
