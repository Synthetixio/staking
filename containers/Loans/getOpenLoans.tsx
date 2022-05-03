import { ethers } from 'ethers';
import { notNill } from 'utils/ts-helpers';
import getLoan from './getLoan';
import { Loan } from './types';

async function getOpenLoans({
	address,
	isL2,
	erc20LoanContract,
	ethLoanContract,
	erc20LoanStateContract,
	ethLoanStateContract,
	subgraphOpenLoans,
}: {
	erc20LoanContract: ethers.Contract | null;
	ethLoanContract: ethers.Contract | null;
	erc20LoanStateContract: ethers.Contract | null;
	ethLoanStateContract: ethers.Contract | null;
	address: string;
	isL2: boolean;
	subgraphOpenLoans: { id: string; collateralMinted: string }[];
}): Promise<Loan[]> {
	const openLoansP = await Promise.all(
		subgraphOpenLoans.map(({ id, collateralMinted }) => {
			const loanContract = collateralMinted === 'sETH' ? ethLoanContract : erc20LoanContract;
			const loanStateContract =
				collateralMinted === 'sETH' ? ethLoanStateContract : erc20LoanStateContract;
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
