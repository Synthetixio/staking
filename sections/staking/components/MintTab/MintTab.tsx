import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import { useTranslation } from 'react-i18next';

import { Transaction, GasLimitEstimate } from 'constants/network';
import UIContainer from 'containers/UI';
import { normalizedGasPrice } from 'utils/network';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { TabContainer } from '../common';
import MintTiles from '../MintTiles';
import StakingInput from '../StakingInput';
import { getMintAmount } from '../helper';
import { useRecoilState, useRecoilValue } from 'recoil';
import { amountToMintState, MintActionType, mintTypeState } from 'store/staking';
import { isWalletConnectedState, delegateWalletState } from 'store/wallet';
import { appReadyState } from 'store/app';
import TransactionNotifier from 'containers/TransactionNotifier';
import { wei } from '@synthetixio/wei';
import { parseSafeWei } from 'utils/parse';

const mintFunction = ({ isDelegate, isMax = false }: { isDelegate: boolean; isMax?: boolean }) => {
	return isDelegate
		? isMax
			? 'issueMaxSynthsOnBehalf'
			: 'issueSynthsOnBehalf'
		: isMax
		? 'issueMaxSynths'
		: 'issueSynths';
};

const MintTab: React.FC = () => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const isAppReady = useRecoilValue(appReadyState);

	const [mintType, onMintTypeChange] = useRecoilState(mintTypeState);
	const [amountToMint, onMintChange] = useRecoilState(amountToMintState);

	const { targetCRatio, SNXRate, unstakedCollateral } = useStakingCalculations();

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);

	const [error, setError] = useState<string | null>(null);

	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const { t } = useTranslation();

	const { setTitle } = UIContainer.useContainer();

	// header title
	useEffect(() => {
		setTitle('staking', 'mint');
	}, [setTitle]);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				try {
					setError(null);
					if (delegateWallet && !delegateWallet.canMint) {
						throw new Error(t('staking.actions.mint.action.error.delegate-cannot-mint'));
					}
					const {
						contracts: { Synthetix },
						utils: { parseEther },
					} = synthetix.js!;
					let gasEstimate;

					if (unstakedCollateral.eq(0))
						throw new Error(t('staking.actions.mint.action.error.insufficient'));

					if (amountToMint.length > 0 && mintType == MintActionType.CUSTOM) {
						gasEstimate = await synthetix.getGasEstimateForTransaction({
							txArgs: delegateWallet
								? [delegateWallet.address, parseEther(amountToMint)]
								: [parseEther(amountToMint)],
							method:
								Synthetix.estimateGas[
									mintFunction({
										isDelegate: !!delegateWallet,
									})
								],
						});
					} else {
						gasEstimate = await synthetix.getGasEstimateForTransaction({
							txArgs: delegateWallet ? [delegateWallet.address] : [],
							method:
								Synthetix.estimateGas[
									mintFunction({
										isDelegate: !!delegateWallet,
										isMax: true,
									})
								],
						});
					}
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					console.log(error);
					let errorMessage = error.message;
					if (error.code === 'INVALID_ARGUMENT') {
						errorMessage = t('staking.actions.mint.action.error.bad-input');
					} else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
						errorMessage = t('staking.actions.mint.action.error.insufficient');
					}
					setError(errorMessage);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [amountToMint, isWalletConnected, unstakedCollateral, isAppReady, t, delegateWallet]);

	const handleStake = useCallback(
		async (mintMax: boolean) => {
			if (isAppReady) {
				try {
					setError(null);
					setTxModalOpen(true);
					if (delegateWallet && !delegateWallet.canMint) {
						throw new Error(t('staking.actions.mint.action.error.delegate-cannot-mint'));
					}
					const {
						contracts: { Synthetix },
						utils: { parseEther },
					} = synthetix.js!;

					let transaction: ethers.ContractTransaction;

					if (mintMax) {
						const mintFunc = mintFunction({
							isDelegate: !!delegateWallet,
							isMax: true,
						});
						const gasLimit = await synthetix.getGasEstimateForTransaction({
							txArgs: delegateWallet ? [delegateWallet.address] : [],
							method: Synthetix.estimateGas[mintFunc],
						});
						transaction = delegateWallet
							? await Synthetix[mintFunc](delegateWallet.address, {
									gasPrice: normalizedGasPrice(gasPrice),
									gasLimit,
							  })
							: await Synthetix[mintFunc]({
									gasPrice: normalizedGasPrice(gasPrice),
									gasLimit,
							  });
					} else {
						const mintFunc = mintFunction({
							isDelegate: !!delegateWallet,
							isMax: false,
						});
						const amountToMintBN = parseEther(amountToMint);
						const gasLimit = await synthetix.getGasEstimateForTransaction({
							txArgs: delegateWallet ? [delegateWallet.address, amountToMintBN] : [amountToMintBN],
							method: Synthetix.estimateGas[mintFunc],
						});
						transaction = delegateWallet
							? await Synthetix[mintFunc](delegateWallet.address, amountToMintBN, {
									gasPrice: normalizedGasPrice(gasPrice),
									gasLimit,
							  })
							: await Synthetix.issueSynths(amountToMintBN, {
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
							onTxFailed: (error) => {
								console.log('Transaction failed', error);
								setTransactionState(Transaction.PRESUBMIT);
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
		[amountToMint, gasPrice, monitorTransaction, isAppReady, delegateWallet, t]
	);

	const returnPanel = useMemo(() => {
		let onSubmit;
		let inputValue;
		let isLocked;
		switch (mintType) {
			case MintActionType.MAX:
				const mintAmount = getMintAmount(targetCRatio, unstakedCollateral, SNXRate);
				onSubmit = () => handleStake(true);
				inputValue = mintAmount;
				onMintChange(inputValue.toString());
				isLocked = true;
				break;
			case MintActionType.CUSTOM:
				onSubmit = () => handleStake(false);
				inputValue = parseSafeWei(amountToMint, 0);
				isLocked = false;
				break;
			default:
				return <MintTiles />;
		}
		return (
			<StakingInput
				onSubmit={onSubmit}
				inputValue={inputValue}
				isLocked={isLocked}
				isMint={true}
				onBack={onMintTypeChange}
				error={error}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={gasLimitEstimate}
				setGasPrice={setGasPrice}
				onInputChange={onMintChange}
				txHash={txHash}
				transactionState={transactionState}
				setTransactionState={setTransactionState}
			/>
		);
	}, [
		mintType,
		error,
		gasLimitEstimate,
		txModalOpen,
		txHash,
		transactionState,
		SNXRate,
		amountToMint,
		onMintChange,
		onMintTypeChange,
		targetCRatio,
		unstakedCollateral,
		handleStake,
	]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

export default MintTab;
