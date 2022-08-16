import { CurrencyKey } from './currency';

export const PROD_HOSTNAME = 'staking.synthetix.io';

export const EXTERNAL_LINKS = {
  Trading: {
    Kwenta: 'https://kwenta.io',
    KwentaTrading: 'https://kwenta.io/exchange',
    DexAG: 'https://dex.ag/',
    Uniswap: 'https://uniswap.exchange/',
    OneInchLink: (from: CurrencyKey, to: CurrencyKey) =>
      `https://1inch.exchange/#/1/swap/${from}/${to}`,
  },
  Synthetix: {
    Home: 'https://www.synthetix.io',
    Litepaper: 'https://docs.synthetix.io/litepaper/',
    Incentives: 'https://docs.synthetix.io/incentives/',
    SIP60: 'https://sips.synthetix.io/sips/sip-60',
    OEBlog: 'https://blog.synthetix.io/l2-mainnet-launch/',
    MintrL2: 'https://l2.mintr.synthetix.io',
    HamalRelease: 'https://blog.synthetix.io/the-hamal-release/',
    DebtPoolSynthesis: 'https://blog.synthetix.io/debt-pool-synthesis-2/',
    StakingGuide: 'https://blog.synthetix.io/basics-of-staking-snx-2022/',
    SIP148Liquidations: 'https://blog.synthetix.io/new-liquidation-mechanism/',
    Governance: 'https://governance.synthetix.io',
  },
  Social: {
    Twitter: 'https://twitter.com/synthetix_io',
    Blog: 'https://blog.synthetix.io/',
    Discord: 'https://discordapp.com/invite/AEdUHzt',
    GitHub: 'https://github.com/synthetixio/staking',
  },
  TokenLists: {
    OneInch: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
    Zapper: 'https://zapper.fi/api/token-list',
  },
  L2: {
    Optimism: 'https://app.optimism.io/',
    SynthetixDeposit: 'https://app.optimism.io/bridge',
    SynthetixWithdrawal: 'https://app.optimism.io/bridge/withdraw',
  },
  Uniswap: {
    dSNXPool: 'https://info.uniswap.org/#/pools/0x9957c4795ab663622db54fc48fda874da59150ff',
  },
  Toros: {
    dSNXPool: 'https://toros.finance/pool/0x59babc14dd73761e38e5bda171b2298dc14da92d',
  },
  dHedge: {
    snxDebtMirrorDocs: 'https://docs.dhedge.org/dhedge-original-pools/v2-snx-debt-mirror',
    blogPost: 'https://blog.synthetix.io/dhedge-debt-mirror-index-token-2/',
    dSNXPool: 'https://app.dhedge.org/pool/0x65bb99e80a863e0e27ee6d09c794ed8c0be47186',
  },
  multichain: {
    app: 'https://app.multichain.org/',
  },
};
