import { BigNumber, ethers } from 'ethers';
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

type Args =
	| {
			id: number;
			loanContract: ethers.Contract;
			isL2: true;
	  }
	| {
			id: number;
			loanStateContract: ethers.Contract;
			address: string;
			isL2: false;
	  };
const fetchLoan = async (args: Args): Promise<[PartialLoan, LoanContractResponse]> => {
	const raw: LoanContractResponse = args.isL2
		? await args.loanContract.loans(args.id)
		: await args.loanStateContract.getLoan(args.address, String(args.id));
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
};
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
			? await fetchLoan({ id, loanStateContract, address, isL2: false })
			: await fetchLoan({ id, loanContract, isL2: true }),
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
