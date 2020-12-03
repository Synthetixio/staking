import { CurrencyKey } from 'constants/currency';

export type LiquidityPoolData = {
	distribution: number;
	address: string;
	price: number;
	balance: number;
	periodFinish: number;
	// staked: {
	// 	balance: number;
	// 	asset: CurrencyKey;
	// };
	// rewards: number;
};
