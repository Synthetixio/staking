import { CurrencyKey } from './currency';

export const EXTERNAL_LINKS = {
	Trading: {
		Kwenta: 'https://kwenta.io',
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
		Incentives: 'https://docs.synthetix.io/incentives/',
		SIP60: 'https://sips.synthetix.io/sips/sip-60',
	},
	Social: {
		Twitter: 'https://twitter.com/synthetix_io',
		Blog: 'https://blog.synthetix.io/',
		Discord: 'https://discordapp.com/invite/AEdUHzt',
		GitHub: 'https://github.com/synthetixio/staking',
	},
};
