import { NetworkId } from '@synthetixio/contracts-interface';
import { WeiSource } from '@synthetixio/wei';
import { SPACE_KEY } from 'constants/snapshot';
import { CurrencyKey, Synths } from './currency';
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
	Liquidations: {
		LiquidationsData: (walletAddress: string, networkId: NetworkId) => [
			'liquidations',
			'liquidationsData',
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
	Network: {
		SNXTotalSupply: ['network', 'snxTotalSupply'],
	},
	Trades: {
		AllTrades: ['trades', 'allTrades'],
		WalletTrades: (walletAddress: string) => ['trades', 'walletTrades', walletAddress],
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
		StakingRewards: (walletAddress: string, networkId: NetworkId) => [
			'escrow',
			'stakingRewards',
			walletAddress,
			networkId,
		],
		TokenSale: (walletAddress: string, networkId: NetworkId) => [
			'escrow',
			'tokenSale',
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
		Balancer: (walletAddress: string, synth: Synths, networkId: NetworkId) => [
			'liquidityPools',
			synth,
			walletAddress,
			networkId,
		],
		sUSD: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'curve',
			walletAddress,
			networkId,
		],
		sEUR: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'sEUR',
			walletAddress,
			networkId,
		],
		DHTsUSD: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'DHT-sUSD',
			walletAddress,
			networkId,
		],
		yearnSNX: (walletAddress: string, networkId: NetworkId) => [
			'liquidityPools',
			'yearn-SNX',
			walletAddress,
			networkId,
		],
	},
	Delegate: {
		AuthoriserWallets: (walletAddress: string, networkId: NetworkId) => [
			'delegate',
			'authoriserWallets',
			walletAddress,
			networkId,
		],
		DelegateWallets: (walletAddress: string, networkId: NetworkId) => [
			'delegate',
			'delegateWallets',
			walletAddress,
			networkId,
		],
	},
	ShortRewards: {
		sBTC: (walletAddress: string, networkId: NetworkId) => [
			'shortRewards',
			'sBTC',
			walletAddress,
			networkId,
		],
		sETH: (walletAddress: string, networkId: NetworkId) => [
			'shortRewards',
			'sETH',
			walletAddress,
			networkId,
		],
	},
	Deposits: {
		Data: (walletAddress: string, networkId: NetworkId) => [
			'deposits',
			'depositsData',
			walletAddress,
			networkId,
		],
		IsActive: (walletAddress: string, networkId: NetworkId) => [
			'deposits',
			'depositsIsActive',
			walletAddress,
			networkId,
		],
	},
	Withdrawals: {
		Data: (walletAddress: string, networkId: NetworkId) => [
			'withdrawals',
			'withdrawalsData',
			walletAddress,
			networkId,
		],
		IsActive: (walletAddress: string, networkId: NetworkId) => [
			'withdrawals',
			'withdrawalsIsActive',
			walletAddress,
			networkId,
		],
	},
	Swap: {
		quote1Inch: (walletAddress: string, networkId: NetworkId, amount: WeiSource) => [
			'quote',
			'1inch',
			walletAddress,
			networkId,
			amount,
		],
		swap1Inch: (
			walletAddress: string,
			networkId: NetworkId,
			amount: WeiSource,
			fromAddress: string
		) => ['swap', '1inch', walletAddress, networkId, amount, fromAddress],
	},
	Gov: {
		DebtOwnership: (walletAddress: string, networkId: NetworkId, block?: number | null) => [
			'gov',
			'debtOwnership',
			walletAddress,
			networkId,
			block,
		],
		SnapshotSpace: (spaceKey: SPACE_KEY) => ['gov', 'snapshotSpace', spaceKey],
		Proposals: (spaceKey: SPACE_KEY, walletAddress: string, networkId: NetworkId) => [
			'gov',
			'proposals',
			spaceKey,
			walletAddress,
			networkId,
		],
		ActiveProposals: (walletAddress: string, networkId: NetworkId) => [
			'gov',
			'activeProposals',
			walletAddress,
			networkId,
		],
		LatestSnapshot: ['gov', 'latestSnapshot'],
		Proposal: (spaceKey: SPACE_KEY, hash: string) => ['gov', 'proposal', spaceKey, hash],
		VotingWeight: (spaceKey: SPACE_KEY, block: number | null) => [
			'gov',
			'votingWeight',
			spaceKey,
			block,
		],
		HasVotedForElections: (walletAddress: string) => ['gov', 'hasVotedForElections', walletAddress],
	},
	TokenLists: {
		Synthetix: ['tokenLists', 'synthetix'],
		Zapper: ['tokenLists', 'zapper'],
		OneInch: ['tokenLists', 'oneInch'],
	},
};

export default QUERY_KEYS;
