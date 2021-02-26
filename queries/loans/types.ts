import { Big } from 'utils/formatters/big-number';

export type Loan = {
	id: Big;
	currency: string;
	collateral: Big;
	amount: Big;
	type: string;
	minCRatio: Big;
	cratio: Big;
	pnl: Big;
	pnlPercentage: Big;
	accruedInterestUSD: Big;
	collateralAsset: string;
	debtAsset: string;
};

export type LoanEntity = {
	id: Big;
	account: string;
	collateral: Big;
	currency: string;
	amount: Big;
	short: boolean;
	accruedInterest: Big;
	interestIndex: Big;
	lastInteraction: Big;
};
