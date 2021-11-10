import { CurrencyKey } from './currency';

export const EXTERNAL_LINKS = {
	Trading: {
		Kwenta: 'https://kwenta.io',
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
	},
	Social: {
		Twitter: 'https://twitter.com/synthetix_io',
		Blog: 'https://blog.synthetix.io/',
		Discord: 'https://discordapp.com/invite/AEdUHzt',
		GitHub: 'https://github.com/synthetixio/staking',
	},
	TokenLists: {
		Synthetix: 'https://synths.snx.eth.link',
		OneInch: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
		Zapper: 'https://zapper.fi/api/token-list',
	},
	L2: {
		Optimism: 'https://gateway.optimism.io/welcome',
		SynthetixDeposit:
			'https://gateway.optimism.io/?l1Token=0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f&l2Token=0x8700daec35af8ff88c16bdf0418774cb3d7599b4',
		SynthetixWithdrawal:
			'https://gateway.optimism.io/?l1Token=0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f&l2Token=0x8700daec35af8ff88c16bdf0418774cb3d7599b4',
	},
};
