import { createContainer } from 'unstated-next';
import { useMemo, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';

import { renBTCToken } from 'contracts';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { walletAddressState, networkState } from 'store/wallet';
import { LOAN_TYPE_ERC20, LOAN_TYPE_ETH, SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { sleep } from 'utils/promise';
import Wei, { wei } from '@synthetixio/wei';

const SECONDS_IN_A_YR = 365 * 24 * 60 * 60;
const COLLATERAL_ASSETS: Record<string, string> = {
	[LOAN_TYPE_ERC20]: 'renBTC',
	[LOAN_TYPE_ETH]: 'ETH',
};

export default createContainer(Container);

function Container() {
	const { provider, signer, synthetixjs } = Connector.useContainer();
	const address = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	const [isLoadingLoans, setIsLoadingLoans] = useState(false);
	// TODO types in this class are all around missing
	const [loans, setLoans] = useState<Array<any>>([]);
	const [minCRatios, setMinCRatios] = useState<Map<string, Wei>>(new Map());

	const [
		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
		collateralManagerContract,
		exchangeRatesContract,
	] = useMemo(() => {
		if (!(isAppReady && synthetixjs && signer && address))
			return [null, null, null, null, null, null];
		const {
			contracts: {
				CollateralEth: ethLoanContract,
				CollateralErc20: erc20LoanContract,
				CollateralStateEth: ethLoanStateContract,
				CollateralStateErc20: erc20LoanStateContract,
				CollateralManager: collateralManagerContract,
				ExchangeRates: exchangeRatesContract,
			},
		} = synthetixjs;
		return [
			ethLoanContract,
			erc20LoanContract,
			ethLoanStateContract,
			erc20LoanStateContract,
			collateralManagerContract,
			exchangeRatesContract,
		];
	}, [isAppReady, signer, synthetixjs]);

	useEffect(() => {
		if (
			!(
				isAppReady &&
				address &&
				provider &&
				exchangeRatesContract &&
				ethLoanContract &&
				erc20LoanContract &&
				ethLoanStateContract &&
				erc20LoanStateContract
			)
		)
			return;

		const loanContracts: Record<string, typeof erc20LoanContract> = {
			[LOAN_TYPE_ERC20]: erc20LoanContract,
			[LOAN_TYPE_ETH]: ethLoanContract,
		};

		const loanStateContracts: Record<string, typeof erc20LoanContract> = {
			[LOAN_TYPE_ERC20]: erc20LoanStateContract,
			[LOAN_TYPE_ETH]: ethLoanStateContract,
		};

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const loadLoans = async () => {
			setIsLoadingLoans(true);
			const loanIndices = await Promise.all(Object.keys(loanStateContracts).map(getLoanIndices));
			if (isMounted) {
				loanIndices.forEach(({ type, minCRatio }) => {
					setMinCRatios((cratios) => cratios.set(type, minCRatio.mul(1e2)));
				});
			}

			const loans: Array<any> = await Promise.all(loanIndices.map(getLoans));
			let activeLoans: Array<any> = [];

			loans.forEach((a) => {
				a.forEach(({ type, minCRatio, loan }: any) => {
					if (!loan.amount.eq(0)) {
						activeLoans.push({
							loan,
							type,
							minCRatio,
						});
					}
				});
			});

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
			]).catch((err) => {
				console.log('getLoanIndices', err);
				throw err;
			});
			const loanIndices = [];
			for (let i = 0; i < n; i++) {
				loanIndices.push(i);
			}
			return { type, minCRatio: wei(minCRatio), loanIndices };
		};

		const getLoans = async ({ type, minCRatio, loanIndices }: Record<any, any>) => {
			return Promise.all(loanIndices.map(getLoan.bind(null, type, minCRatio)));
		};

		const getLoan = async (type: string, minCRatio: Wei, loanIndex: number) => {
			const loanStateContract = loanStateContracts[type];
			return {
				type,
				minCRatio,
				loan: await loanStateContract.loans(address, loanIndex),
			};
		};

		const makeLoan = async ({ loan, type, minCRatio }: Record<any, any>) => {
			const loanContract = loanContracts[type];
			return {
				...loan,
				type,
				minCRatio,
				cratio: await loanContract.collateralRatio(loan),
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
		provider,
		exchangeRatesContract,
		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
	]);

	const [interestRate, setInterestRate] = useState(wei(0));
	const [issueFeeRates, setIssueFeeRates] = useState<Record<string, Wei>>({
		[LOAN_TYPE_ERC20]: wei(0),
		[LOAN_TYPE_ETH]: wei(0),
	});
	const [interactionDelays, setInteractionDelays] = useState<Record<string, Wei>>({
		[LOAN_TYPE_ERC20]: wei(0),
		[LOAN_TYPE_ETH]: wei(0),
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
				const perYr = SECONDS_IN_A_YR / 1e18;
				setInterestRate(wei(borrowRate.toString()).mul(wei(perYr.toString())));
				setIssueFeeRates({
					[LOAN_TYPE_ERC20]: wei(erc20BorrowIssueFeeRate.toString()).mul(1 / 1e18),
					[LOAN_TYPE_ETH]: wei(ethBorrowIssueFeeRate.toString()).mul(1 / 1e18),
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
		ethLoanContract: typeof erc20LoanContract,
		isMounted: boolean,
		setPendingWithdrawals: (pw: ethers.BigNumber) => void,
		address: string
	) => {
		const pw = await ethLoanContract!.pendingWithdrawals(address);
		if (isMounted) {
			setPendingWithdrawals(pw);
		}
	};

	const reloadPendingWithdrawals = async () => {
		if (address && ethLoanContract) {
			await sleep(1000);
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
		// eslint-disable-next-line
	}, [ethLoanContract, address]);

	return {
		loans,
		isLoadingLoans,

		interestRate,
		issueFeeRates,
		interactionDelays,
		minCRatios,

		pendingWithdrawals,
		reloadPendingWithdrawals,

		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
		collateralManagerContract,
		exchangeRatesContract,
		renBTCContract,
	};
}
