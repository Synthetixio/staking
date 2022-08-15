export const ROUTES = {
  Home: '/',
  Staking: {
    Home: '/staking',
    Burn: '/staking/burn',
    Mint: '/staking/mint',
  },
  Pools: {
    snx_weth: '/pools/weth-snx',
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
    sFB_LP: '/earn/sFB-LP',
    sAAPL_LP: '/earn/sAAPL-LP',
    sAMZN_LP: '/earn/sAMZN-LP',
    sNFLX_LP: '/earn/sNFLX-LP',
    sGOOG_LP: '/earn/sGOOG-LP',
    sMSFT_LP: '/earn/sMSFT-LP',
    sCOIN_LP: '/earn/sCOIN-LP',
    sUSD_EXTERNAL: 'https://www.curve.fi/susdv2/',
    sUSD_EXTERNAL_OPTIMISM: 'https://optimism.curve.fi/factory/0',
    sEURO_EXTERNAL: 'https://www.curve.fi/eurs/',
    DHT_LP: '/earn/DHT-LP',
    sBTC_EXTERNAL: 'https://kwenta.io/shorting',
    sBTC_SHORT: '/earn/sBTC-SHORT',
    sETH_EXTERNAL: 'https://kwenta.io/shorting',
    sETH_SHORT: '/earn/sETH-SHORT',
    yearn_SNX_VAULT: '/earn/yearn-SNX',
    LIQUIDATION_REWARDS: '/earn/liquidation',
  },
  EscrowMigrate: { Home: '/migrate-escrow' },
  Gov: {
    Home: '/gov',
    Space: (spaceKey: string) => `/gov/${spaceKey}`,
    Create: (spaceKey: string) => `/gov/${spaceKey}/create`,
    Proposal: (spaceKey: string, id: string) => `/gov/${spaceKey}/${id}`,
  },
  Bridge: { Home: '/bridge' },
  Loans: {
    Home: '/loans',
    New: '/loans/new',
    List: '/loans/list',
  },
  Delegate: {
    Home: '/delegate',
  },
  MergeAccounts: {
    Home: '/merge-accounts',
    Burn: '/merge-accounts/burn',
    Nominate: '/merge-accounts/nominate',
    Merge: '/merge-accounts/merge',
  },
};

export default ROUTES;
