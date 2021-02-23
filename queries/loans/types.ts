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
