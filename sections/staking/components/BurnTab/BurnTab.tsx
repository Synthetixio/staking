import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TabContainer } from '../common';
import { Synths } from 'constants/currency';
import Notify from 'containers/Notify';
import { ethers } from 'ethers';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import synthetix from 'lib/synthetix';
import BurnTiles from '../BurnTiles';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import StakingInput from '../StakingInput';
import { Transaction } from 'constants/network';
import { toBigNumber } from 'utils/formatters/number';
import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { addSeconds, differenceInSeconds } from 'date-fns';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import { appReadyState } from 'store/app';

// @TODO: Add for the countdown of waiting period and issuance delay

const BurnTab: React.FC = () => {
	const { monitorHash } = Notify.useContainer();
	const [amountToBurn, onBurnChange] = useRecoilState(amountToBurnState);
	const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);
	const { percentageTargetCRatio, debtBalance, issuableSynths } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
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

					if (debtBalance.isZero()) throw new Error('staking.actions.burn.action.error.no-debt');
					if (Number(amountToBurn) > sUSDBalance.toNumber() || maxBurnAmount.isZero())
						throw new Error('staking.actions.burn.action.error.insufficient');
					if (waitingPeriod) throw new Error('staking.actions.burn.action.error.waiting-period');
					if (issuanceDelay) throw new Error('staking.actions.burn.action.error.issuance-period');
					const gasEstimate = await getGasEstimateForTransaction(
						[parseEther(amountToBurn.toString())],
						Synthetix.estimateGas.burnSynths
					);

					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [
		isWalletConnected,
		isAppReady,
		error,
		amountToBurn,
		debtBalance,
		issuanceDelay,
		sUSDBalance,
		waitingPeriod,
	]);

	const handleBurn = useCallback(
		async (burnToTarget: boolean) => {
			if (isAppReady) {
				try {
					setError(null);
					setTxModalOpen(true);
					const {
						contracts: { Synthetix, Issuer },
						utils: { formatBytes32String, parseEther },
					} = synthetix.js!;

					if (await Synthetix.isWaitingPeriod(formatBytes32String(Synths.sUSD)))
						throw new Error('Waiting period for sUSD is still ongoing');
					if (!burnToTarget && !(await Issuer.canBurnSynths(walletAddress)))
						throw new Error('Waiting period to burn is still ongoing');

					let transaction: ethers.ContractTransaction;

					if (burnToTarget) {
						const gasLimit = await getGasEstimateForTransaction(
							[],
							Synthetix.estimateGas.burnSynthsToTarget
						);
						console.log('here', gasPrice, gasLimit);
						transaction = await Synthetix.burnSynthsToTarget({
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit: gasLimit,
						});

						console.log(transaction);
					} else {
						const amountToBurnBN = parseEther(amountToBurn.toString());
						const gasLimit = getGasEstimateForTransaction(
							[amountToBurnBN],
							Synthetix.estimateGas.burnSynths
						);
						transaction = await Synthetix.burnSynths(amountToBurnBN, {
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						});
					}
					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorHash({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
							},
						});
						onBurnChange('0');
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setError(e.message);
				}
			}
		},
		[amountToBurn, gasPrice, monitorHash, walletAddress, isAppReady]
	);

	const returnPanel = useMemo(() => {
		let handleSubmit;
		let inputValue;
		let isLocked;

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
			default:
				return (
					<BurnTiles
						percentageTargetCRatio={percentageTargetCRatio}
						maxBurnAmount={maxBurnAmount}
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
	]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

export default BurnTab;
