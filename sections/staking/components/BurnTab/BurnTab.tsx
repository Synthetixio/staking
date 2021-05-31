import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useRecoilState, useRecoilValue } from 'recoil';

import TransactionNotifier from 'containers/TransactionNotifier';
import UIContainer from 'containers/UI';
import { normalizedGasPrice } from 'utils/network';
import { CryptoCurrency, Synths } from 'constants/currency';
import { TabContainer } from '../common';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import synthetix from 'lib/synthetix';
import BurnTiles from '../BurnTiles';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import StakingInput from '../StakingInput';
import { Transaction } from 'constants/network';
import { formatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';
import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { addSeconds, differenceInSeconds } from 'date-fns';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import { appReadyState } from 'store/app';
import { GasLimitEstimate } from 'constants/network';

// @TODO: Add for the countdown of waiting period and issuance delay
import Connector from 'containers/Connector';
import useClearDebtCalculations from 'sections/staking/hooks/useClearDebtCalculations';
import { useTranslation } from 'react-i18next';
import { toFutureDate } from 'utils/formatters/date';
import useETHBalanceQuery from 'queries/walletBalances/useETHBalanceQuery';

const BurnTab: React.FC = () => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const [amountToBurn, onBurnChange] = useRecoilState(amountToBurnState);
	const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);
	const { percentageTargetCRatio, debtBalance, issuableSynths } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const { signer } = Connector.useContainer();
	const { t } = useTranslation();

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [waitingPeriod, setWaitingPeriod] = useState(0);
	const [issuanceDelay, setIssuanceDelay] = useState(0);

	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const synthsBalancesQuery = useSynthsBalancesQuery();
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const sUSDBalance = synthBalances?.balancesMap.sUSD
		? synthBalances.balancesMap.sUSD.balance
		: toBigNumber(0);

	const {
		needToBuy,
		debtBalanceWithBuffer,
		missingSUSDWithBuffer,
		quoteAmount,
		swapData,
	} = useClearDebtCalculations(debtBalance, sUSDBalance, walletAddress!);

	const ethBalanceQuery = useETHBalanceQuery();
	const ethBalance = ethBalanceQuery.data ?? zeroBN;

	const { setTitle } = UIContainer.useContainer();

	const getMaxSecsLeftInWaitingPeriod = useCallback(async () => {
		const {
			contracts: { Exchanger },
			utils: { formatBytes32String },
		} = synthetix.js!;

		try {
			const maxSecsLeftInWaitingPeriod = await Exchanger.maxSecsLeftInWaitingPeriod(
				walletAddress,
				formatBytes32String('sUSD')
			);
			setWaitingPeriod(Number(maxSecsLeftInWaitingPeriod));
		} catch (e) {
			console.log(e);
		}
	}, [walletAddress]);

	const getIssuanceDelay = useCallback(async () => {
		const {
			contracts: { Issuer },
		} = synthetix.js!;

		try {
			const [canBurnSynths, lastIssueEvent, minimumStakeTime] = await Promise.all([
				Issuer.canBurnSynths(walletAddress),
				Issuer.lastIssueEvent(walletAddress),
				Issuer.minimumStakeTime(),
			]);

			if (Number(lastIssueEvent) && Number(minimumStakeTime)) {
				const burnUnlockDate = addSeconds(Number(lastIssueEvent) * 1000, Number(minimumStakeTime));
				const issuanceDelayInSeconds = differenceInSeconds(burnUnlockDate, new Date());
				setIssuanceDelay(
					issuanceDelayInSeconds > 0 ? issuanceDelayInSeconds : canBurnSynths ? 0 : 1
				);
			}
		} catch (e) {
			console.log(e);
		}
		// eslint-disable-next-line
	}, [walletAddress, debtBalance]);

	// header title
	useEffect(() => {
		setTitle('staking', 'burn');
	}, [setTitle]);

	useEffect(() => {
		getMaxSecsLeftInWaitingPeriod();
		getIssuanceDelay();
	}, [getMaxSecsLeftInWaitingPeriod, getIssuanceDelay]);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && amountToBurn.length > 0 && isWalletConnected) {
				try {
					setError(null);
					const {
						contracts: { Synthetix },
						utils: { parseEther },
					} = synthetix.js!;

					const maxBurnAmount = debtBalance.isGreaterThan(sUSDBalance)
						? toBigNumber(sUSDBalance)
						: debtBalance;

					if (debtBalance.isZero()) throw new Error(t('staking.actions.burn.action.error.no-debt'));
					if (
						(Number(amountToBurn) > sUSDBalance.toNumber() || maxBurnAmount.isZero()) &&
						burnType !== BurnActionType.CLEAR
					)
						throw new Error(t('staking.actions.burn.action.error.insufficient'));

					if (
						burnType === BurnActionType.CLEAR &&
						toBigNumber(quoteAmount).isGreaterThan(ethBalance)
					) {
						throw new Error(t('staking.actions.burn.action.error.insufficient-eth-1inch'));
					}

					if (waitingPeriod) {
						throw new Error(
							t('staking.actions.burn.action.error.waiting-period', {
								date: toFutureDate(waitingPeriod),
							})
						);
					}

					if (issuanceDelay && burnType !== BurnActionType.TARGET) {
						throw new Error(
							t('staking.actions.burn.action.error.issuance-period', {
								date: toFutureDate(issuanceDelay),
							})
						);
					}

					if (burnType === BurnActionType.CLEAR) {
						const gasEstimate = await synthetix.getGasEstimateForTransaction({
							txArgs: [parseEther(sUSDBalance.toString())],
							method: Synthetix.estimateGas.burnSynths,
						});
						setGasLimitEstimate(gasEstimate);
					} else {
						const gasEstimate = await synthetix.getGasEstimateForTransaction({
							txArgs: [parseEther(amountToBurn.toString())],
							method: Synthetix.estimateGas.burnSynths,
						});
						setGasLimitEstimate(gasEstimate);
					}
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [
		isWalletConnected,
		t,
		isAppReady,
		error,
		amountToBurn,
		debtBalance,
		issuanceDelay,
		sUSDBalance,
		waitingPeriod,
		burnType,
		ethBalance,
		quoteAmount,
	]);

	const handleBurn = useCallback(
		async (burnToTarget: boolean) => {
			if (isAppReady) {
				try {
					setError(null);
					setTxModalOpen(true);
					const {
						contracts: { Synthetix },
						utils: { parseEther },
					} = synthetix.js!;

					let transaction: ethers.ContractTransaction;

					if (burnToTarget) {
						const gasLimit = await synthetix.getGasEstimateForTransaction({
							txArgs: [],
							method: Synthetix.estimateGas.burnSynthsToTarget,
						});
						transaction = await Synthetix.burnSynthsToTarget({
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit: gasLimit,
						});
					} else {
						const amountToBurnBN = parseEther(amountToBurn.toString());
						const gasLimit = await synthetix.getGasEstimateForTransaction({
							txArgs: [amountToBurnBN],
							method: Synthetix.estimateGas.burnSynths,
						});
						transaction = await Synthetix.burnSynths(amountToBurnBN, {
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						});
					}
					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
							},
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setError(e.message);
				}
			}
		},
		[amountToBurn, gasPrice, monitorTransaction, isAppReady]
	);

	const handleClear = useCallback(async () => {
		if (!swapData || !signer) {
			return;
		}

		try {
			setError(null);
			setTxModalOpen(true);

			const swapTransaction = await signer?.sendTransaction({
				from: swapData.from,
				to: swapData.to,
				value: swapData.value,
				gasPrice: swapData.gasPrice,
				data: swapData.data,
			});

			if (swapTransaction) {
				setTxHash(swapTransaction.hash);
				setTransactionState(Transaction.WAITING);
				monitorTransaction({
					txHash: swapTransaction.hash,
					onTxConfirmed: async () => {
						const {
							contracts: { Synthetix },
							utils: { parseEther },
						} = synthetix.js!;

						let burnTransaction: ethers.ContractTransaction;

						const amountToBurnBN = parseEther(amountToBurn.toString());
						const gasLimit = await synthetix.getGasEstimateForTransaction({
							txArgs: [amountToBurnBN],
							method: Synthetix.estimateGas.burnSynths,
						});
						burnTransaction = await Synthetix.burnSynths(amountToBurnBN, {
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						});

						setTxHash(burnTransaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: burnTransaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
							},
						});
						setTxModalOpen(false);
					},
				});
			}
		} catch (e) {
			setTransactionState(Transaction.PRESUBMIT);
			setError(e.message);
		}
	}, [amountToBurn, gasPrice, monitorTransaction, signer, swapData]);

	const returnPanel = useMemo(() => {
		let handleSubmit;
		let inputValue;
		let isLocked;
		let etherNeededToBuy;
		let sUSDNeededToBuy;
		let sUSDNeededToBurn;

		/* If a user has more sUSD than the debt balance, the max burn amount is their debt balance, else it is just the balance they have */
		const maxBurnAmount = debtBalance.isGreaterThan(sUSDBalance)
			? toBigNumber(sUSDBalance)
			: debtBalance;

		const burnAmountToFixCRatio = toBigNumber(
			Math.max(debtBalance.minus(issuableSynths).toNumber(), 0)
		);

		switch (burnType) {
			case BurnActionType.MAX:
				onBurnChange(maxBurnAmount.toString());
				handleSubmit = () => {
					handleBurn(false);
				};
				inputValue = maxBurnAmount;
				isLocked = true;
				break;
			case BurnActionType.TARGET:
				const calculatedTargetBurn = Math.max(debtBalance.minus(issuableSynths).toNumber(), 0);
				onBurnChange(calculatedTargetBurn.toString());
				handleSubmit = () => {
					handleBurn(true);
				};
				inputValue = toBigNumber(calculatedTargetBurn);
				isLocked = true;
				break;
			case BurnActionType.CUSTOM:
				handleSubmit = () => handleBurn(false);
				inputValue = toBigNumber(amountToBurn);
				isLocked = false;
				break;
			case BurnActionType.CLEAR:
				if (!needToBuy) {
					onBurnTypeChange(BurnActionType.MAX);
					handleSubmit = () => {
						handleBurn(false);
					};
					inputValue = maxBurnAmount;
					isLocked = true;
					break;
				}
				onBurnChange(debtBalanceWithBuffer.toString());
				handleSubmit = () => handleClear();
				inputValue = toBigNumber(debtBalanceWithBuffer);
				isLocked = true;
				if (quoteAmount) {
					etherNeededToBuy = formatCurrency(CryptoCurrency.ETH, quoteAmount, {
						currencyKey: CryptoCurrency.ETH,
					});
				}
				sUSDNeededToBuy = formatCurrency(Synths.sUSD, missingSUSDWithBuffer);
				sUSDNeededToBurn = formatCurrency(Synths.sUSD, debtBalanceWithBuffer);
				break;
			default:
				return (
					<BurnTiles
						percentageTargetCRatio={percentageTargetCRatio}
						burnAmountToFixCRatio={burnAmountToFixCRatio}
					/>
				);
		}
		return (
			<StakingInput
				onSubmit={handleSubmit}
				inputValue={inputValue}
				isLocked={isLocked}
				isMint={false}
				onBack={onBurnTypeChange}
				error={error}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={gasLimitEstimate}
				setGasPrice={setGasPrice}
				onInputChange={onBurnChange}
				txHash={txHash}
				transactionState={transactionState}
				setTransactionState={setTransactionState}
				maxBurnAmount={maxBurnAmount}
				burnAmountToFixCRatio={burnAmountToFixCRatio}
				etherNeededToBuy={etherNeededToBuy}
				sUSDNeededToBuy={sUSDNeededToBuy}
				sUSDNeededToBurn={sUSDNeededToBurn}
			/>
		);
	}, [
		burnType,
		error,
		gasLimitEstimate,
		txModalOpen,
		txHash,
		transactionState,
		amountToBurn,
		debtBalance,
		handleBurn,
		issuableSynths,
		onBurnChange,
		onBurnTypeChange,
		percentageTargetCRatio,
		sUSDBalance,
		debtBalanceWithBuffer,
		handleClear,
		missingSUSDWithBuffer,
		needToBuy,
		quoteAmount,
	]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

export default BurnTab;
