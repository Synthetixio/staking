import { BigNumber, Contract, ethers } from 'ethers';
import { parseBytes32String } from 'ethers/lib/utils';
import { Loan } from './types';

type LoanContractResponse = [
  id: BigNumber,
  account: string,
  collateral: BigNumber,
  currency: string,
  amount: BigNumber,
  short: boolean,
  accruedInterest: BigNumber,
  interestIndex: BigNumber,
  lastInteraction: BigNumber
];

type PartialLoan = Omit<Loan, 'minCratio' | 'cratio' | 'collateralAsset'>;

function parseLoan(raw: LoanContractResponse): [PartialLoan, LoanContractResponse] {
  const [
    _id,
    account,
    collateral,
    currency,
    amount,
    _short,
    accruedInterest,
    interestIndex,
    lastInteraction,
  ] = raw;
  return [
    {
      id: _id,
      account,
      collateral,
      currency: parseBytes32String(currency),
      amount,
      accruedInterest,
      interestIndex,
      lastInteraction,
    },
    raw,
  ];
}

async function fetchLoanL1(loanStateContract: Contract, address: string, id: number) {
  const raw: LoanContractResponse = await loanStateContract.getLoan(address, String(id));
  return parseLoan(raw);
}

async function fetchLoanL2(loanContract: Contract, id: number) {
  const raw: LoanContractResponse = await loanContract.loans(id);
  return parseLoan(raw);
}

const getLoan = async ({
  id,
  loanContract,
  loanStateContract,
  address,
  isL2,
}: {
  id: number;
  loanContract: ethers.Contract;
  loanStateContract: ethers.Contract | null;
  address: string;
  isL2: boolean;
}): Promise<Loan> => {
  if (!isL2 && !loanStateContract) {
    throw Error('On mainnet we require a loanStateContract');
  }
  const [[partialLoan, raw], minCratio, collateralAsset]: [
    [PartialLoan, LoanContractResponse],
    BigNumber,
    string
  ] = await Promise.all([
    loanStateContract && !isL2
      ? fetchLoanL1(loanStateContract, address, id)
      : fetchLoanL2(loanContract, id),
    loanContract.minCratio(),
    loanContract.collateralKey(),
  ]);
  const cratio = isL2
    ? await loanContract.collateralRatio(id)
    : await loanContract.collateralRatio(raw);
  return {
    ...partialLoan,
    cratio,
    minCratio,
    collateralAsset: parseBytes32String(collateralAsset),
  };
};
export default getLoan;
