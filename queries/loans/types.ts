import { ethers } from 'ethers';

export type Loan = {
	id: ethers.BigNumber;
	account: string;
	collateral: ethers.BigNumber;
	currency: string;
	amount: ethers.BigNumber;
	accruedInterest: ethers.BigNumber;
	interestIndex: ethers.BigNumber;
	lastInteraction: ethers.BigNumber;

	// derived
	type: string;
	minCRatio: ethers.BigNumber;
	cratio: ethers.BigNumber;
	collateralAsset: string;
	debtAsset: string;
};
