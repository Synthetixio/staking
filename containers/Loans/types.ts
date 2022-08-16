import { BigNumber } from 'ethers';

export type Loan = {
  account: string;
  amount: BigNumber;
  collateral: BigNumber;
  cratio: BigNumber;
  minCratio: BigNumber;
  currency: string;
  collateralAsset: string;
  id: BigNumber;
  accruedInterest: BigNumber;
  interestIndex: BigNumber;
  lastInteraction: BigNumber;
};
