import { NetworkId } from '@synthetixio/js';
import { CurrencyKey } from './currency';
import { Period } from './period';

export const QUERY_KEYS = {
	Debt: {
		WalletDebtData: (walletAddress: string, networkId: NetworkId) => [
			'debt',
			'walletDebtData',
			walletAddress,
			networkId,
		],
	},
	Staking: {
		FeePoolData: (period: string) => ['staking', 'feePoolData', period],
	},
	Rates: {
		HistoricalVolume: (currencyKey: CurrencyKey, period: Period) => [
			'rates',
			'historicalVolume',
			currencyKey,
			period,
		],
		HistoricalRates: (currencyKey: CurrencyKey, period: Period) => [
			'rates',
			'historicalRates',
			currencyKey,
			period,
		],
		MarketCap: (currencyKey: CurrencyKey) => ['marketCap', currencyKey],
		ExchangeRates: ['rates', 'exchangeRates'],
		CurrencyRates: ['rates', 'currencyRates'],
		SynthExchanges: (period: Period) => ['rates', 'synthExchanges', period],
	},
	Network: {
		EthGasStation: ['network', 'ethGasStation'],
		SNXTotalSupply: ['network', 'snxTotalSupply'],
	},
	WalletBalances: {
		Synths: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'synths',
			walletAddress,
			networkId,
		],
		ETH: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'ETH',
			walletAddress,
			networkId,
		],
		SNX: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'SNX',
			walletAddress,
			networkId,
		],
		Tokens: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'tokens',
			walletAddress,
			networkId,
		],
	},
	Synths: {
		FrozenSynths: ['synths', 'frozenSynths'],
		Suspension: (currencyKey: CurrencyKey) => ['synths', 'suspension', currencyKey],
		FeeReclaimPeriod: (currencyKey: CurrencyKey) => ['synths', 'feeReclaimPeriod', currencyKey],
		ExchangeFeeRate: (quoteCurrencyKey: CurrencyKey, baseCurrencyKey: CurrencyKey) => [
			'synths',
			'exchangeFeeRate',
			quoteCurrencyKey,
			baseCurrencyKey,
		],
	},
	Trades: {
		AllTrades: ['trades', 'allTrades'],
		WalletTrades: (walletAddress: string) => ['trades', 'walletTrades', walletAddress],
	},
	SystemStatus: {
		IsUpgrading: ['systemStatus', 'isUpgrading'],
	},
};

export default QUERY_KEYS;
