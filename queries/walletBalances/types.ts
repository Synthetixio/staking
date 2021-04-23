import BigNumber from 'bignumber.js';
import { CurrencyKey } from 'constants/currency';

export type CryptoBalance = {
	currencyKey: CurrencyKey;
	balance: BigNumber;
	usdBalance: BigNumber;
	synth?: string;
};

export type Asset = {
	currencyKey: string;
	balance: BigNumber;
};
