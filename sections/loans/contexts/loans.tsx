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
import { walletAddressState, networkState } from 'store/wallet';
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

	pendingWithdrawals: ethers.BigNumber;
	reloadPendingWithdrawals: () => void;

	ethLoanContract: ethers.Contract | null;
	erc20LoanContract: ethers.Contract | null;
	ethLoanStateContract: ethers.Contract | null;
	erc20LoanStateContract: ethers.Contract | null;
	collateralManagerContract: ethers.Contract | null;
	exchangeRatesContract: ethers.Contract | null;
	renBTCContract: ethers.Contract | null;
};

const LoansContext = createContext<Context | null>(null);

type LoansProviderProps = {
	children: ReactNode;
};

export const LoansProvider: React.FC<LoansProviderProps> = ({ children }) => {
	const { provider, signer } = Connector.useContainer();
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

	const [
		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
		collateralManagerContract,
		exchangeRatesContract,
	] = useMemo(() => {
		if (!(isAppReady && synthetix.js)) return [null, null, null, null, null, null];
		const {
			contracts: {
				CollateralEth: ethLoanContract,
				CollateralErc20: erc20LoanContract,
				CollateralStateEth: ethLoanStateContract,
				CollateralStateErc20: erc20LoanStateContract,
				CollateralManager: collateralManagerContract,
				ExchangeRates: exchangeRatesContract,
			},
		} = synthetix.js;
		return [
			ethLoanContract,
			erc20LoanContract,
			ethLoanStateContract,
			erc20LoanStateContract,
			collateralManagerContract,
			exchangeRatesContract,
		];
	}, [isAppReady]);

	const subgraphs: Record<string, Function> = useMemo(
		() => ({
			[LOAN_TYPE_ERC20]: erc20LoansSubgraph,
			[LOAN_TYPE_ETH]: ethLoansSubgraph,
		}),
		[erc20LoansSubgraph, ethLoansSubgraph]
	);

	useEffect(() => {
		if (
			!(
				isAppReady &&
				provider &&
				ethLoanContract &&
				erc20LoanContract &&
				ethLoanStateContract &&
				erc20LoanStateContract &&
				exchangeRatesContract
			)
		)
			return;

		const loanContracts: Record<string, ethers.Contract> = {
			[LOAN_TYPE_ERC20]: erc20LoanContract,
			[LOAN_TYPE_ETH]: ethLoanContract,
		};

		const loanStateContracts: Record<string, ethers.Contract> = {
			[LOAN_TYPE_ERC20]: erc20LoanStateContract,
			[LOAN_TYPE_ETH]: ethLoanStateContract,
		};

		const queries: Record<string, string> = {
			[LOAN_TYPE_ERC20]: 'erc20Loans',
			[LOAN_TYPE_ETH]: 'ethLoans',
		};

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

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

		const getLoanIndices = async (type: string) => {
			const loanContract = loanContracts[type];
			const loanStateContract = loanStateContracts[type];
			const [n, minCRatio] = await Promise.all([
				loanStateContract.getNumLoans(address),
				loanContract.minCratio(),
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
			const loanStateContract = loanStateContracts[type];
			return {
				type,
				minCRatio,
				loan: await loanStateContract.loans(address, loanIndex),
			};
		};

		const makeLoan = async ({ loan, type, minCRatio }: Record<any, any>) => {
			const loanContract = loanContracts[type];
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
			const { blockNumber: creationBlockNumber } = await provider.getTransaction(txHash);
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
				cratio: await loanContract.collateralRatio(loan),
				pnl,
				pnlPercentage,
				accruedInterestUSD,
				collateralAsset: COLLATERAL_ASSETS[type],
				debtAsset: SYNTH_BY_CURRENCY_KEY[loan.currency],
			};
		};

		// subscribe to loan open+close
		const subscribe = () => {
			for (const type in loanContracts) {
				const loanContract = loanContracts[type];
				const loanStateContract = loanStateContracts[type];

				const fetchLoan = async (owner: string, id: string) => {
					return makeLoan({
						loan: await loanStateContract.getLoan(owner, id),
						type,
						minCRatio: await loanContract.minCratio(),
					});
				};

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

				const loanCreatedEvent = loanContract.filters.LoanCreated(address);
				const loanClosedEvent = loanContract.filters.LoanClosed(address);
				const collateralDepositedEvent = loanContract.filters.CollateralDeposited(address);
				const collateralWithdrawnEvent = loanContract.filters.CollateralWithdrawn(address);
				const loanDrawnDownEvent = loanContract.filters.LoanDrawnDown(address);
				const loanRepaymentMadeEvent = loanContract.filters.LoanRepaymentMade(address);

				loanContract.on(loanCreatedEvent, onLoanCreated);
				loanContract.on(loanClosedEvent, onLoanClosed);
				loanContract.on(collateralDepositedEvent, onCollateralDeposited);
				loanContract.on(collateralWithdrawnEvent, onCollateralWithdrawn);
				loanContract.on(loanDrawnDownEvent, onLoanDrawnDown);
				loanContract.on(loanRepaymentMadeEvent, onLoanRepaymentMade);

				unsubs.push(() => loanContract.off(loanCreatedEvent, onLoanCreated));
				unsubs.push(() => loanContract.off(loanClosedEvent, onLoanClosed));
				unsubs.push(() => loanContract.off(collateralDepositedEvent, onCollateralDeposited));
				unsubs.push(() => loanContract.off(collateralWithdrawnEvent, onCollateralWithdrawn));
				unsubs.push(() => loanContract.off(loanDrawnDownEvent, onLoanDrawnDown));
				unsubs.push(() => loanContract.off(loanRepaymentMadeEvent, onLoanRepaymentMade));
			}
		};

		loadLoans();
		subscribe();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [
		isAppReady,
		address,
		erc20LoansSubgraph,
		ethLoansSubgraph,
		provider,
		exchangeRatesContract,
		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
		subgraphs,
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
		if (
			!(
				isAppReady &&
				collateralManagerContract &&
				erc20LoanContract &&
				ethLoanContract &&
				erc20LoanContract &&
				ethLoanContract
			)
		)
			return;

		let isMounted = true;
		const load = async () => {
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
	}, [isAppReady, collateralManagerContract, erc20LoanContract, ethLoanContract]);

	// pending withdrawals

	const [pendingWithdrawals, setPendingWithdrawals] = useState(ethers.BigNumber.from('0'));

	const loadPendingWithdrawals = async (
		ethLoanContract: ethers.Contract,
		isMounted: boolean,
		setPendingWithdrawals: (pw: ethers.BigNumber) => void,
		address: string
	) => {
		const pw = await ethLoanContract.pendingWithdrawals(address);
		if (isMounted) {
			setPendingWithdrawals(pw);
		}
	};

	const reloadPendingWithdrawals = async () => {
		if (address && ethLoanContract) {
			await loadPendingWithdrawals(ethLoanContract, true, setPendingWithdrawals, address);
		}
	};

	useEffect(() => {
		if (!(ethLoanContract && address)) return;
		let isMounted = true;
		(async () => {
			loadPendingWithdrawals(ethLoanContract, isMounted, setPendingWithdrawals, address);
		})();
		return () => {
			isMounted = false;
		};
	}, [ethLoanContract, address]);

	return (
		<LoansContext.Provider
			value={{
				loans,
				isLoadingLoans,

				interestRate,
				issueFeeRates,
				interactionDelays,

				pendingWithdrawals,
				reloadPendingWithdrawals,

				ethLoanContract,
				erc20LoanContract,
				ethLoanStateContract,
				erc20LoanStateContract,
				collateralManagerContract,
				exchangeRatesContract,
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
