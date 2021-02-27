import {
	useMemo,
	useEffect,
	useState,
	createContext,
	useContext,
	useCallback,
	ReactNode,
} from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

import { renBTCToken } from 'contracts';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import synthetix from 'lib/synthetix';
import { isWalletConnectedState, walletAddressState, networkState } from 'store/wallet';
import { Big, toBig } from 'utils/formatters/big-number';
import { LOAN_TYPE_ERC20, LOAN_TYPE_ETH, SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { Loan } from 'queries/loans/types';

const SECONDS_IN_A_YR = 365 * 24 * 60 * 60;
const COLLATERAL_ASSETS: Record<string, string> = {
	[LOAN_TYPE_ERC20]: 'renBTC',
	[LOAN_TYPE_ETH]: 'ETH',
};

type Context = {
	loans: Loan[];
	isLoadingLoans: boolean;
	interestRate: Big;
	issueFeeRates: Record<string, Big>;
	interactionDelays: Record<string, Big>;
	renBTCContract: ethers.Contract | null;
};

const LoansContext = createContext<Context | null>(null);

type LoansProviderProps = {
	children: ReactNode;
};

export const LoansProvider: React.FC<LoansProviderProps> = ({ children }) => {
	const { provider, signer } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const address = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	const [isLoadingLoans, setIsLoadingLoans] = useState(false);
	const [loans, setLoans] = useState<Array<Loan>>([]);

	const kovan = network!?.name === 'kovan';
	// todo: put in a config
	const erc20LoansSubgraphUrl = kovan
		? 'https://api.thegraph.com/subgraphs/name/vbstreetz/collateral-erc20-loans-kovan'
		: 'https://api.thegraph.com/subgraphs/name/vbstreetz/collateral-erc20-loans';
	const ethLoansSubgraphUrl = kovan
		? 'https://api.thegraph.com/subgraphs/name/vbstreetz/collateral-eth-loans-kovan'
		: 'https://api.thegraph.com/subgraphs/name/vbstreetz/collateral-eth-loans';

	const subgraph = (subgraphUrl: string) => async (query: any, variables: any) => {
		const res = await fetch(subgraphUrl, {
			method: 'POST',
			body: JSON.stringify({ query, variables }),
		});
		const { data } = await res.json();
		return data;
	};

	const erc20LoansSubgraph = useCallback(
		(query: any, variables: any) => subgraph(erc20LoansSubgraphUrl)(query, variables),
		[erc20LoansSubgraphUrl]
	);

	const ethLoansSubgraph = useCallback(
		(query: any, variables: any) => subgraph(ethLoansSubgraphUrl)(query, variables),
		[ethLoansSubgraphUrl]
	);

	useEffect(() => {
		if (!(isAppReady && isWalletConnected && provider && signer)) return;

		const {
			contracts: {
				CollateralEth: ethLoanContract,
				CollateralErc20: erc20LoanContract,
				CollateralStateEth: ethLoanStateContract,
				CollateralStateErc20: erc20LoanStateContract,
				ExchangeRates: exchangeRatesContract,
			},
		} = synthetix.js!;

		const loanContracts: Record<string, ethers.Contract> = {
			[LOAN_TYPE_ERC20]: erc20LoanContract,
			[LOAN_TYPE_ETH]: ethLoanContract,
		};

		const loanStateContracts: Record<string, ethers.Contract> = {
			[LOAN_TYPE_ERC20]: erc20LoanStateContract,
			[LOAN_TYPE_ETH]: ethLoanStateContract,
		};

		const subgraphs: Record<string, Function> = {
			[LOAN_TYPE_ERC20]: erc20LoansSubgraph,
			[LOAN_TYPE_ETH]: ethLoansSubgraph,
		};

		const queries: Record<string, string> = {
			[LOAN_TYPE_ERC20]: 'erc20Loans',
			[LOAN_TYPE_ETH]: 'ethLoans',
		};

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const getLoanIndices = async (type: string) => {
			const [n, minCRatio] = await Promise.all([
				loanStateContracts[type].getNumLoans(address),
				loanContracts[type].minCratio(),
			]);
			const loanIndices = [];
			for (let i = 0; i < n; i++) {
				loanIndices.push(i);
			}
			return { type, minCRatio, loanIndices };
		};

		const getLoans = async ({ type, minCRatio, loanIndices }: Record<any, any>) => {
			return Promise.all(loanIndices.map(getLoan.bind(null, type, minCRatio)));
		};

		const getLoan = async (type: string, minCRatio: Big, loanIndex: number) => {
			return {
				type,
				minCRatio,
				loan: await loanStateContracts[type].loans(address, loanIndex),
			};
		};

		const makeLoan = async ({ loan, type, minCRatio }: Record<any, any>) => {
			const variables = {
				id: loan.id.toString(),
			};
			const subgraph = subgraphs[type];
			const query = queries[type];
			const {
				[query]: [{ txHash }],
			} = await subgraph(
				`query ($id: String!) {
          ${query}(where: {id: $id}) {
            txHash
          }
        }`,
				variables
			);
			const { blockNumber: creationBlockNumber } = await provider!.getTransaction(txHash);
			// const interest = loan.amount.add(loan.accruedInterest).mul(debtUSDPrice);
			let [initialUSDPrice, latestUSDPrice] = await Promise.all([
				exchangeRatesContract.rateForCurrency(loan.currency, {
					blockTag: creationBlockNumber,
				}),
				exchangeRatesContract.rateForCurrency(loan.currency),
			]);
			const loanAmount = toBig(loan.amount).div(1e18);
			initialUSDPrice = toBig(initialUSDPrice).div(1e18);
			latestUSDPrice = toBig(latestUSDPrice).div(1e18);
			let pnlPercentage;
			if ('short' === type) {
				pnlPercentage = initialUSDPrice.sub(latestUSDPrice).div(initialUSDPrice);
			} else {
				pnlPercentage = latestUSDPrice.sub(initialUSDPrice).div(latestUSDPrice);
			}
			const pnl = pnlPercentage.mul(loanAmount).mul(initialUSDPrice);
			pnlPercentage = pnlPercentage.mul(1e2);

			const accruedInterestUSD = toBig(loan.accruedInterest).mul(latestUSDPrice);

			return {
				...loan,
				type,
				minCRatio,
				cratio: await loanContracts[type].collateralRatio(loan),
				pnl,
				pnlPercentage,
				accruedInterestUSD,
				collateralAsset: COLLATERAL_ASSETS[type],
				debtAsset: SYNTH_BY_CURRENCY_KEY[loan.currency],
			};
		};

		const loadLoans = async () => {
			setIsLoadingLoans(true);

			const loanIndices = await Promise.all(Object.keys(loanStateContracts).map(getLoanIndices));
			const loans: Array<any> = await Promise.all(loanIndices.map(getLoans));
			let activeLoans: Array<any> = [];
			for (let i = 0; i < loans.length; i++) {
				for (let j = 0; j < loans[i].length; j++) {
					const { type, minCRatio, loan } = loans[i][j];
					if (!loan.amount.isZero()) {
						activeLoans.push({
							loan,
							type,
							minCRatio,
						});
					}
				}
			}
			activeLoans = await Promise.all(activeLoans.map(makeLoan));
			activeLoans.sort((a, b) => {
				if (a.id.gt(b.id)) return -1;
				if (a.id.lt(b.id)) return 1;
				return 0;
			});
			if (isMounted) {
				setLoans(activeLoans);
				setIsLoadingLoans(false);
			}
		};

		// subscribe to loan open+close
		const subscribe = () => {
			for (const type in loanContracts) {
				const contract = loanContracts[type];

				const fetchLoan = async (owner: string, id: string) =>
					makeLoan({
						loan: await loanStateContracts[type].getLoan(owner, id),
						type,
						minCRatio: await loanContracts[type].minCratio(),
					});

				const updateLoan = async (owner: string, id: string) => {
					const loan = await fetchLoan(owner, id);
					setLoans((originalLoans) => {
						const loans = originalLoans.slice();
						const idx = loans.findIndex((l) => l.id.eq(id));
						if (~idx) {
							loans[idx] = loan;
						} else {
							console.warn(`unknown loan(id=${id.toString()}, owner=${owner.toString()})`);
						}
						return loans;
					});
				};

				const onLoanCreated = async (owner: string, id: string) => {
					const loan = await fetchLoan(owner, id);
					setLoans((loans) => [loan, ...loans]);
				};

				const onLoanClosed = (owner: string, id: string) => {
					setLoans((loans) => loans.filter((loan) => !loan.id.eq(id)));
				};

				const onCollateralDeposited = async (
					owner: string,
					id: string,
					amount: ethers.BigNumber
				) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								loan.collateral = loan.collateral.add(amount);
							}
							return loan;
						})
					);
					await updateLoan(owner, id);
				};

				const onCollateralWithdrawn = async (
					owner: string,
					id: string,
					amount: ethers.BigNumber
				) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								loan.collateral = loan.collateral.sub(amount);
							}
							return loan;
						})
					);
					await updateLoan(owner, id);
				};

				const onLoanRepaymentMade = async (
					borrower: string,
					repayer: string,
					id: string,
					payment: ethers.BigNumber
				) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								loan.amount = loan.amount.sub(payment);
							}
							return loan;
						})
					);
					await updateLoan(borrower, id);
				};

				const onLoanDrawnDown = async (owner: string, id: string, amount: ethers.BigNumber) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								loan.amount = loan.amount.add(amount);
							}
							return loan;
						})
					);
					await updateLoan(owner, id);
				};

				const loanCreatedEvent = contract.filters.LoanCreated(address);
				const loanClosedEvent = contract.filters.LoanClosed(address);
				const collateralDepositedEvent = contract.filters.CollateralDeposited(address);
				const collateralWithdrawnEvent = contract.filters.CollateralWithdrawn(address);
				const loanDrawnDownEvent = contract.filters.LoanDrawnDown(address);
				const loanRepaymentMadeEvent = contract.filters.LoanRepaymentMade(address);

				contract.on(loanCreatedEvent, onLoanCreated);
				contract.on(loanClosedEvent, onLoanClosed);
				contract.on(collateralDepositedEvent, onCollateralDeposited);
				contract.on(collateralWithdrawnEvent, onCollateralWithdrawn);
				contract.on(loanDrawnDownEvent, onLoanDrawnDown);
				contract.on(loanRepaymentMadeEvent, onLoanRepaymentMade);

				unsubs.push(() => contract.off(loanCreatedEvent, onLoanCreated));
				unsubs.push(() => contract.off(loanClosedEvent, onLoanClosed));
				unsubs.push(() => contract.off(collateralDepositedEvent, onCollateralDeposited));
				unsubs.push(() => contract.off(collateralWithdrawnEvent, onCollateralWithdrawn));
				unsubs.push(() => contract.off(loanDrawnDownEvent, onLoanDrawnDown));
				unsubs.push(() => contract.off(loanRepaymentMadeEvent, onLoanRepaymentMade));
			}
		};

		loadLoans();
		subscribe();
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [
		isAppReady,
		isWalletConnected,
		address,
		erc20LoansSubgraph,
		ethLoansSubgraph,
		provider,
		signer,
	]);

	const [interestRate, setInterestRate] = useState(toBig('0'));
	const [issueFeeRates, setIssueFeeRates] = useState<Record<string, Big>>({
		[LOAN_TYPE_ERC20]: toBig('0'),
		[LOAN_TYPE_ETH]: toBig('0'),
	});
	const [interactionDelays, setInteractionDelays] = useState<Record<string, Big>>({
		[LOAN_TYPE_ERC20]: toBig('0'),
		[LOAN_TYPE_ETH]: toBig('0'),
	});

	const renBTCContract = useMemo(
		(): ethers.Contract | null =>
			!(network && signer) ? null : renBTCToken.makeContract(network['name'], signer),
		[signer, network]
	);

	useEffect(() => {
		if (!isAppReady) return;

		let isMounted = true;
		const load = async () => {
			const {
				contracts: {
					CollateralEth: ethLoanContract,
					CollateralErc20: erc20LoanContract,
					CollateralManager: collateralManagerContract,
				},
			} = synthetix.js!;

			const [
				[borrowRate],
				//
				erc20BorrowIssueFeeRate,
				ethBorrowIssueFeeRate,
				//
				erc20InteractionDelay,
				ethInteractionDelay,
			] = await Promise.all([
				collateralManagerContract.getBorrowRate(),
				//
				erc20LoanContract.issueFeeRate(),
				ethLoanContract.issueFeeRate(),
				//
				erc20LoanContract.interactionDelay(),
				ethLoanContract.interactionDelay(),
			]);
			if (isMounted) {
				const perYr = SECONDS_IN_A_YR * 1e2 * (1 / 1e18);
				setInterestRate(toBig(borrowRate).mul(perYr));
				setIssueFeeRates({
					[LOAN_TYPE_ERC20]: toBig(erc20BorrowIssueFeeRate).mul(1e2 / 1e18),
					[LOAN_TYPE_ETH]: toBig(ethBorrowIssueFeeRate).mul(1e2 / 1e18),
				});
				setInteractionDelays({
					[LOAN_TYPE_ERC20]: erc20InteractionDelay,
					[LOAN_TYPE_ETH]: ethInteractionDelay,
				});
			}
		};

		load();
		return () => {
			isMounted = false;
		};
	}, [isAppReady]);

	return (
		<LoansContext.Provider
			value={{
				loans,
				isLoadingLoans,

				interestRate,
				issueFeeRates,
				interactionDelays,
				renBTCContract,
			}}
		>
			{children}
		</LoansContext.Provider>
	);
};

export function useLoans() {
	const context = useContext(LoansContext);
	if (!context) {
		throw new Error('Missing loans context');
	}
	return context;
}
