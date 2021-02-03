import BigNumber from 'bignumber.js';

export type LiquidityPoolData = {
	distribution: number;
	address: string;
	price: number;
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
};
