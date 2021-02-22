export const ROUTES = {
	Home: '/',
	Loans: {
		New: '/loans/new',
		List: '/loans/list',
	},
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
	},
	L2: {
		Home: '/l2',
		Deposit: '/l2/deposit',
		Migrate: '/l2/migrate',
	},
};

export default ROUTES;
