import BN from 'bn.js';

export type LiquidityPoolData = {
	distribution: number;
	address: string;
	price?: number;
	balance: number;
	periodFinish: number;
	rewards: number;
	staked: number;
	stakedBN: BN;
	allowance: number;
	duration: number;
	userBalance: number;
	userBalanceBN: BN;
	needsToSettle?: boolean;
	liquidity?: number;
};

export type DualRewardsLiquidityPoolData = Omit<LiquidityPoolData, 'distribution' | 'rewards'> & {
	distribution: { a: number; b: number };
	rewards: { a: number; b: number };
};
