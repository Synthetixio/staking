import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';

import Notify from 'containers/Notify';
import { Transaction } from 'constants/network';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { toBigNumber } from 'utils/formatters/number';
import { getGasEstimateForTransaction } from 'utils/transactions';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { TabContainer } from '../common';
import MintTiles from '../MintTiles';
import StakingInput from '../StakingInput';
import { getMintAmount } from '../helper';
import { useRecoilState, useRecoilValue } from 'recoil';
import { amountToMintState, MintActionType, mintTypeState } from 'store/staking';
import { isWalletConnectedState } from 'store/wallet';

const MintTab: React.FC = () => {
	const { monitorHash } = Notify.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const [mintType, onMintTypeChange] = useRecoilState(mintTypeState);
	const [amountToMint, onMintChange] = useRecoilState(amountToMintState);

	const { targetCRatio, SNXRate, unstakedCollateral } = useStakingCalculations();

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);

	const [error, setError] = useState<string | null>(null);

	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [mintMax, setMintMax] = useState<boolean>(false);

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js && isWalletConnected && amountToMint.length > 0) {
				try {
					setError(null);
					const {
						contracts: { Synthetix },
						utils: { parseEther },
					} = synthetix.js!;
					let gasEstimate;
					if (amountToMint.length > 0 && !mintMax) {
						gasEstimate = await getGasEstimateForTransaction(
							[parseEther(amountToMint)],
							Synthetix.estimateGas.issueSynths
						);
					} else {
						gasEstimate = await getGasEstimateForTransaction(
							[],
							Synthetix.estimateGas.issueMaxSynths
						);
					}
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [amountToMint, mintMax, isWalletConnected]);

	const handleStake = useCallback(
		async (mintMax: boolean) => {
			try {
				setError(null);
				setTxModalOpen(true);
				const {
					contracts: { Synthetix },
					utils: { parseEther },
				} = synthetix.js!;

				let transaction: ethers.ContractTransaction;

				if (mintMax) {
					const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.issueMaxSynths);
					transaction = await Synthetix.issueMaxSynths({
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit,
					});
				} else {
					const amountToMintBN = parseEther(amountToMint);
					const gasLimit = getGasEstimateForTransaction(
						[amountToMintBN],
						Synthetix.estimateGas.issueSynths
					);
					transaction = await Synthetix.issueSynths(amountToMintBN, {
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
					setTxModalOpen(false);
				}
			} catch (e) {
				setTransactionState(Transaction.PRESUBMIT);
				setError(e.message);
			}
		},
		[amountToMint, gasPrice, monitorHash]
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
				setMintMax(true);
				break;
			case MintActionType.CUSTOM:
				onSubmit = () => handleStake(false);
				inputValue = toBigNumber(amountToMint);
				isLocked = false;
				setMintMax(false);
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
