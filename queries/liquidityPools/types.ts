import Wei from '@synthetixio/wei';

export type LiquidityPoolData = {
	distribution: Wei;
	address: string;
	price?: Wei;
	balance: Wei;
	periodFinish: number;
	rewards: Wei;
	staked: Wei;
	allowance: Wei;
	duration: number;
	userBalance: Wei;
	needsToSettle?: boolean;
	liquidity?: Wei;
};

export type DualRewardsLiquidityPoolData = Omit<LiquidityPoolData, 'distribution' | 'rewards'> & {
	distribution: { a: Wei; b: Wei };
	rewards: { a: Wei; b: Wei };
};
