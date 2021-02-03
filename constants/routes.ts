export const ROUTES = {
	Home: '/',
	Staking: {
		Home: '/staking',
		Burn: '/staking/burn',
		Mint: '/staking/mint',
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
		sUSD_EXTERNAL: 'https://www.curve.fi/susdv2/',
		sEURO_EXTERNAL: 'https://www.curve.fi/eurs/',
	},
	L2: {
		Home: '/l2',
		Deposit: '/l2/deposit',
		Migrate: '/l2/migrate',
	},
	Gov: {
		Home: '/gov',
		Council: {
			Home: '/gov/counci',
			Create: '/gov/council/create',
			Proposal: '/gov/council/proposal',
		},
		Grants: {
			Home: '/gov/grants',
			Create: 'gov/grants/create',
			Proposal: '/gov/council/proposal',
		},
		Proposals: {
			Home: '/gov/proposals',
			Create: '/gov/proposals/create',
			Proposal: '/gov/proposals/proposal',
		},
	},
};

export default ROUTES;
