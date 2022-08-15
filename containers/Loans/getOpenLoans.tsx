import { ethers } from 'ethers';
import { notNill } from 'utils/ts-helpers';
import getLoan from './getLoan';
import { Loan } from './types';

async function getOpenLoans({
  address,

  ethLoanContract,
  ethLoanStateContract,
  subgraphOpenLoans,
  isL2,
}: {
  ethLoanContract: ethers.Contract | null;

  ethLoanStateContract: ethers.Contract | null;
  address: string;
  isL2: boolean;
  subgraphOpenLoans: { id: string; collateralMinted: string }[];
}): Promise<Loan[]> {
  const openLoansP = await Promise.all(
    subgraphOpenLoans.map(({ id }) => {
      const loanContract = ethLoanContract;
      const loanStateContract = ethLoanStateContract;
      if (!loanContract) return undefined;
      return getLoan({
        loanContract,
        loanStateContract,
        id: Number(id),
        isL2,
        address,
      });
    })
  );

  return openLoansP.filter(notNill);
}

export default getOpenLoans;
