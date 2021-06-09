import Wei from '@synthetixio/wei';

export type LiquidityPoolData = {
	distribution: number;
	address: string;
	price?: number;
	balance: number;
	periodFinish: number;
	rewards: number;
	staked: number;
	stakedBN: Wei;
	allowance: number;
	duration: number;
	userBalance: number;
	userBalanceBN: Wei;
	needsToSettle?: boolean;
	liquidity?: number;
};

export type DualRewardsLiquidityPoolData = Omit<LiquidityPoolData, 'distribution' | 'rewards'> & {
	distribution: { a: number; b: number };
	rewards: { a: number; b: number };
};
