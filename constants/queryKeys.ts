import { WeiSource } from '@synthetixio/wei';
import { SPACE_KEY } from 'constants/snapshot';
import { Synths } from './currency';

export const QUERY_KEYS = {
  Debt: {
    WalletDebtData: (walletAddress: string, networkId: number) => [
      'debt',
      'walletDebtData',
      walletAddress,
      networkId,
    ],
    DebtSnapshot: (walletAddress: string, networkId: number) => [
      'debt',
      'debtSnapshot',
      walletAddress,
      networkId,
    ],
  },
  Liquidations: {
    LiquidationsData: (walletAddress: string, networkId: number) => [
      'liquidations',
      'liquidationsData',
      walletAddress,
      networkId,
    ],
  },
  Staking: {
    MinimumStakeTime: ['minimumStakeTime'],
    FeePoolData: (period: string) => ['staking', 'feePoolData', period],
    FeeClaimHistory: (walletAddress: string, networkId: number) => [
      'staking',
      'feelClaimHistory',
      walletAddress,
      networkId,
    ],
    ClaimableRewards: (walletAddress: string, networkId: number) => [
      'staking',
      'claimableRewards',
      walletAddress,
      networkId,
    ],
    Issued: (walletAddress: string, networkId: number) => [
      'staking',
      'issued',
      walletAddress,
      networkId,
    ],
    Burned: (walletAddress: string, networkId: number) => [
      'staking',
      'burned',
      walletAddress,
      networkId,
    ],
    SNXLockedValue: (networkId: number) => ['staking', 'lockedValue', networkId],
  },
  Network: {
    SNXTotalSupply: ['network', 'snxTotalSupply'],
  },
  Trades: {
    AllTrades: ['trades', 'allTrades'],
    WalletTrades: (walletAddress: string) => ['trades', 'walletTrades', walletAddress],
  },
  Depot: {
    UserActions: (walletAddress: string, networkId: number) => [
      'depot',
      'userActions',
      walletAddress,
      networkId,
    ],
    ClearDeposits: (walletAddress: string, networkId: number) => [
      'depot',
      'clearDeposits',
      walletAddress,
      networkId,
    ],
    Exchanges: (walletAddress: string, networkId: number) => [
      'depot',
      'exchanges',
      walletAddress,
      networkId,
    ],
  },
  Escrow: {
    StakingRewards: (walletAddress: string, networkId: number) => [
      'escrow',
      'stakingRewards',
      walletAddress,
      networkId,
    ],
    TokenSale: (walletAddress: string, networkId: number) => [
      'escrow',
      'tokenSale',
      walletAddress,
      networkId,
    ],
  },
  LiquidityPools: {
    iETH: (walletAddress: string, networkId: number) => [
      'liquidityPools',
      'iETH',
      walletAddress,
      networkId,
    ],
    iBTC: (walletAddress: string, networkId: number) => [
      'liquidityPools',
      'iBTC',
      walletAddress,
      networkId,
    ],
    Balancer: (walletAddress: string, synth: Synths, networkId: number) => [
      'liquidityPools',
      synth,
      walletAddress,
      networkId,
    ],
    sUSD: (walletAddress: string, networkId: number) => [
      'liquidityPools',
      'curve',
      walletAddress,
      networkId,
    ],
    sEUR: (walletAddress: string, networkId: number) => [
      'liquidityPools',
      'sEUR',
      walletAddress,
      networkId,
    ],
    DHTsUSD: (walletAddress: string, networkId: number) => [
      'liquidityPools',
      'DHT-sUSD',
      walletAddress,
      networkId,
    ],
    yearnSNX: (walletAddress: string, networkId: number) => [
      'liquidityPools',
      'yearn-SNX',
      walletAddress,
      networkId,
    ],
  },
  Delegate: {
    AuthoriserWallets: (walletAddress: string, networkId: number) => [
      'delegate',
      'authoriserWallets',
      walletAddress,
      networkId,
    ],
    DelegateWallets: (walletAddress: string, networkId: number) => [
      'delegate',
      'delegateWallets',
      walletAddress,
      networkId,
    ],
  },
  ShortRewards: {
    sBTC: (walletAddress: string, networkId: number) => [
      'shortRewards',
      'sBTC',
      walletAddress,
      networkId,
    ],
    sETH: (walletAddress: string, networkId: number) => [
      'shortRewards',
      'sETH',
      walletAddress,
      networkId,
    ],
  },
  Deposits: {
    Data: (walletAddress: string, networkId: number) => [
      'deposits',
      'depositsData',
      walletAddress,
      networkId,
    ],
    IsActive: (walletAddress: string, networkId: number) => [
      'deposits',
      'depositsIsActive',
      walletAddress,
      networkId,
    ],
  },
  Withdrawals: {
    Data: (walletAddress: string, networkId: number) => [
      'withdrawals',
      'withdrawalsData',
      walletAddress,
      networkId,
    ],
    IsActive: (walletAddress: string, networkId: number) => [
      'withdrawals',
      'withdrawalsIsActive',
      walletAddress,
      networkId,
    ],
  },
  Swap: {
    quote1Inch: (walletAddress: string, networkId: number, amount: WeiSource) => [
      'quote',
      '1inch',
      walletAddress,
      networkId,
      amount,
    ],
    swap1Inch: (
      walletAddress: string,
      networkId: number,
      amount: WeiSource,
      fromAddress: string
    ) => ['swap', '1inch', walletAddress, networkId, amount, fromAddress],
  },
  Gov: {
    DebtOwnership: (walletAddress: string, networkId: number, block?: number | null) => [
      'gov',
      'debtOwnership',
      walletAddress,
      networkId,
      block,
    ],
    SnapshotSpace: (spaceKey: SPACE_KEY) => ['gov', 'snapshotSpace', spaceKey],
    Proposals: (spaceKey: SPACE_KEY, walletAddress: string, networkId: number) => [
      'gov',
      'proposals',
      spaceKey,
      walletAddress,
      networkId,
    ],
    ActiveProposals: (walletAddress: string, networkId: number) => [
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
