import BN from 'bn.js';
import { CurrencyKey } from 'constants/currency';

export type CryptoBalance = {
	currencyKey: CurrencyKey;
	balance: BN;
	usdBalance: BN;
	synth?: string;
};
