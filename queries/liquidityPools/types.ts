import BigNumber from 'bignumber.js';

export type LiquidityPoolData = {
	distribution: number;
	address: string;
	price?: number;
	balance: number;
	periodFinish: number;
	rewards: number;
	staked: number;
	stakedBN: BigNumber;
	allowance: number;
	duration: number;
	userBalance: number;
	userBalanceBN: BigNumber;
	needsToSettle?: boolean;
	liquidity?: number;
};

export type DualRewardsLiquidityPoolData = Omit<LiquidityPoolData, 'distribution' | 'rewards'> & {
	distribution: { a: number; b: number };
	rewards: { a: number; b: number };
};
