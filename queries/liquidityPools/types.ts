import { CurrencyKey } from 'constants/currency';

export type LiquidityPoolData = {
	distribution: number;
	address: string;
	price: number;
	balance: number;
	periodFinish: number;
	rewards: number;
	staked: number;
	allowance: number;
	duration: number;
};
