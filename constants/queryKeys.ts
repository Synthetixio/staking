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
		DebtSnapshot: (walletAddress: string, networkId: NetworkId) => [
			'debt',
			'debtSnapshot',
			walletAddress,
			networkId,
		],
	},
	Staking: {
		FeePoolData: (period: string) => ['staking', 'feePoolData', period],
		FeeClaimHistory: (walletAddress: string, networkId: NetworkId) => [
			'staking',
			'feelClaimHistory',
			walletAddress,
			networkId,
		],
		ClaimableRewards: (walletAddress: string, networkId: NetworkId) => [
			'staking',
			'claimableRewards',
			walletAddress,
			networkId,
		],
		Issued: (walletAddress: string, networkId: NetworkId) => [
			'staking',
			'issued',
			walletAddress,
			networkId,
		],
		Burned: (walletAddress: string, networkId: NetworkId) => [
			'staking',
			'burned',
			walletAddress,
			networkId,
		],
		SNXLockedValue: (networkId: NetworkId) => ['staking', 'lockedValue', networkId],
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
		SNX24hrPrices: ['rates', 'SNX24hrPrices'],
		CurrencyRates: (currencyKeys: CurrencyKey[]) => [
			'rates',
			'currencyRates',
			currencyKeys.join(','),
		],
		SynthExchanges: (period: Period) => ['rates', 'synthExchanges', period],
	},
	Network: {
		EthGasPrice: ['network', 'ethGasPrice'],
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
		TotalIssuedSynths: ['synths', 'totalIssuedSynths'],
	},
	Trades: {
		AllTrades: ['trades', 'allTrades'],
		WalletTrades: (walletAddress: string) => ['trades', 'walletTrades', walletAddress],
	},
	SystemStatus: {
		IsUpgrading: ['systemStatus', 'isUpgrading'],
	},
	Depot: {
		UserActions: (walletAddress: string, networkId: NetworkId) => [
			'depot',
			'userActions',
			walletAddress,
			networkId,
		],
		ClearDeposits: (walletAddress: string, networkId: NetworkId) => [
			'depot',
			'clearDeposits',
			walletAddress,
			networkId,
		],
		Exchanges: (walletAddress: string, networkId: NetworkId) => [
			'depot',
			'exchanges',
			walletAddress,
			networkId,
		],
	},
	Escrow: {
		Data: (walletAddress: string, networkId: NetworkId) => [
			'escrow',
			'data',
			walletAddress,
			networkId,
		],
	},
	LiquidityPools: {
		iETH: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'iETH',
			walletAddress,
			networkId,
		],
		iBTC: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'iBTC',
			walletAddress,
			networkId,
		],
		Curve: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'curve',
			walletAddress,
			networkId,
		],
	},
};

export default QUERY_KEYS;
