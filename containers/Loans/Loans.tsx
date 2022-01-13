import { createContainer } from 'unstated-next';
import { useMemo, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { BigNumber, ethers } from 'ethers';

import { renBTCToken } from 'contracts';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { walletAddressState, networkState, isL2State } from 'store/wallet';
import { LOAN_TYPE_ERC20, LOAN_TYPE_ETH } from 'sections/loans/constants';
import { sleep } from 'utils/promise';
import Wei, { wei } from '@synthetixio/wei';
import getOpenLoans from './getOpenLoans';
import { Loan } from './types';
import getLoan from './getLoan';
import getMinCRatios from './getMinCratios';

const SECONDS_IN_A_YR = 365 * 24 * 60 * 60;

function Container() {
	const { provider, signer, synthetixjs } = Connector.useContainer();
	const address = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	const [isLoadingLoans, setIsLoadingLoans] = useState(false);
	const [loans, setLoans] = useState<Loan[]>([]);
	const [minCRatios, setMinCRatios] = useState<{
		ethMinCratio: Wei | undefined;
		erc20MinCratio: Wei | undefined;
	}>({ ethMinCratio: undefined, erc20MinCratio: undefined });
	const [pendingWithdrawals, setPendingWithdrawals] = useState(BigNumber.from('0'));

	const [
		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
		collateralManagerContract,
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
			},
		} = synthetixjs;
		return [
			ethLoanContract,
			erc20LoanContract,
			ethLoanStateContract,
			erc20LoanStateContract,
			collateralManagerContract,
		];
	}, [isAppReady, signer, synthetixjs, address]);

	useEffect(() => {
		if (!ethLoanContract) return;
		let isMounted = true;
		getMinCRatios({ ethLoanContract, erc20LoanContract }).then((minCRatios) => {
			if (isMounted) {
				setMinCRatios(minCRatios);
			}
		});
		return () => {
			isMounted = false;
		};
	}, [erc20LoanContract, ethLoanContract, isL2]);

	useEffect(() => {
		if (!(isAppReady && address && provider && ethLoanContract)) {
			return;
		}
		if (!isL2 && !erc20LoanContract) return; // erc20LoanContract only exists on L1

		const loanContracts = [erc20LoanContract, ethLoanContract];
		const loanStateContracts: [ethers.Contract | null, ethers.Contract | null] = [
			erc20LoanStateContract,
			ethLoanStateContract,
		];
		let isMounted = true;
		const unsubs: Array<Function> = [
			() => {
				isMounted = false;
			},
		];
		const loadLoans = async () => {
			setIsLoadingLoans(true);
			const openLoans = await getOpenLoans({
				loanContracts,
				loanStateContracts,
				address,
				network,
				isL2,
			});
			if (isMounted) {
				setLoans(openLoans);
				setIsLoadingLoans(false);
			}
		};

		// subscribe to loan open+close
		const subscribe = () => {
			loanContracts.forEach((loanContract, i) => {
				if (!loanContract) return;
				const loanStateContract = loanStateContracts[i];
				const updateLoan = async (owner: string, id: BigNumber) => {
					const loan = await getLoan({
						id: id.toNumber(),
						loanContract,
						loanStateContract,
						isL2,
						address,
					});
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

				const onLoanCreated = async (_address: string, id: BigNumber) => {
					const loan = await getLoan({
						id: id.toNumber(),
						loanContract,
						loanStateContract,
						isL2,
						address,
					});
					setLoans((loans) => [loan, ...loans]);
				};

				const onLoanClosed = (_owner: string, id: BigNumber) => {
					setLoans((loans) => loans.filter((loan) => !loan.id.eq(id)));
				};

				const onCollateralDeposited = async (owner: string, id: BigNumber, amount: BigNumber) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								return { ...loan, collateral: loan.collateral.add(amount) };
							}
							return loan;
						})
					);
					await updateLoan(owner, id);
				};

				const onCollateralWithdrawn = async (owner: string, id: BigNumber, amount: BigNumber) => {
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
					_repayer: string,
					id: BigNumber,
					payment: BigNumber
				) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								return { ...loan, amount: loan.amount.sub(payment) };
							}
							return loan;
						})
					);
					await updateLoan(borrower, id);
				};

				const onLoanDrawnDown = async (owner: string, id: BigNumber, amount: BigNumber) => {
					setLoans((loans) =>
						loans.map((loan) => {
							if (loan.id.eq(id)) {
								return { ...loan, amount: loan.amount.add(amount) };
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
			});
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
		ethLoanContract,
		erc20LoanContract,
		ethLoanStateContract,
		erc20LoanStateContract,
		isL2,
		network,
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
	const loadPendingWithdrawals = async (
		ethLoanContract: typeof erc20LoanContract,
		isMounted: boolean,
		setPendingWithdrawals: (pw: BigNumber) => void,
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
		renBTCContract,
	};
}
export default createContainer(Container);
