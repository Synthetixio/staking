import { BigNumber, ethers, providers } from 'ethers';
import { Network } from 'store/wallet';
import { getInfuraRpcURL } from 'utils/infura';
import getLoan from './getLoan';
import { Loan } from './types';

/**
 * Note, once the subgraphs has synced up on optimism it would make sense to use those instead the events log
 */

type CreatedLoansArgsResponse = [
	address: string,
	id: BigNumber,
	amount: BigNumber,
	collateral: BigNumber,
	currency: string,
	issuanceFee: BigNumber
];
type ClosedLoansArgsResponse = [address: string, id: BigNumber];

const loadOpenLoanIds = async (
	loanContract: ethers.Contract,
	address: string,
	network: Network | null
) => {
	const infuraUrl = getInfuraRpcURL(network?.id);
	const newContract = loanContract.connect(new providers.JsonRpcProvider(infuraUrl));

	const [loanCreatedEvents, loanClosedEvents] = await Promise.all([
		newContract.queryFilter(newContract.filters.LoanCreated(address)),
		newContract.queryFilter(newContract.filters.LoanClosed(address)),
	]);
	const closedLoansById = loanClosedEvents.reduce((acc: { [id: number]: true | undefined }, e) => {
		const data = e.args as ClosedLoansArgsResponse;
		const [_account, id] = data;
		acc[id.toNumber()] = true;
		return acc;
	}, {});

	const openLoans = loanCreatedEvents
		.filter((e) => {
			const data = e.args as CreatedLoansArgsResponse;
			const [_account, id] = data;
			return !closedLoansById[id.toNumber()]; // remove closed loans
		})
		.map((e) => {
			const data = e.args as CreatedLoansArgsResponse;
			const [_account, id] = data;
			return id.toNumber();
		});

	const x = openLoans;
	return x;
};

async function getOpenLoans({
	address,
	network,
	isL2,
	loanContracts,
	loanStateContracts,
}: {
	loanContracts: Array<ethers.Contract | null>;
	loanStateContracts: Array<ethers.Contract | null>;
	address: string;
	network: Network | null;
	isL2: boolean;
}): Promise<Loan[]> {
	const openLoansP = loanContracts.map(async (loanContract, i) => {
		const loanStateContract = loanStateContracts[i];
		if (!loanContract) return [];
		const openLoanIds = await loadOpenLoanIds(loanContract, address, network);
		return Promise.all(
			openLoanIds.map((id) =>
				getLoan({
					loanContract,
					loanStateContract,
					id,
					isL2,
					address,
				})
			)
		);
	});

	const allOpenLoans = await Promise.all(openLoansP);
	return allOpenLoans.flat();
}

export default getOpenLoans;
