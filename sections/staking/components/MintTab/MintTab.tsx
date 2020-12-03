import React, { useEffect, useState } from 'react';
import { SynthetixJS } from '@synthetixio/js';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';

import Notify from 'containers/Notify';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { Transaction } from 'constants/network';

import { TabContainer } from '../common';
import Staking, { MintActionType } from 'sections/staking/context/StakingContext';
import MintTiles from '../MintTiles';
import StakingInput from '../StakingInput';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { getMintAmount } from '../helper';
import { toBigNumber } from 'utils/formatters/number';

const MintTab: React.FC = () => {
	const { monitorHash } = Notify.useContainer();
	const { amountToMint, onMintChange, mintType, onMintTypeChange } = Staking.useContainer();
	const { targetCRatio, SNXRate, unstakedCollateral } = useStakingCalculations();

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [stakingTxError, setStakingTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						synthetix.js?.contracts.Synthetix.estimateGas.issueMaxSynths
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [synthetix, error]);

	const handleStake = async (mintMax: boolean) => {
		try {
			setStakingTxError(false);
			setTxModalOpen(true);
			const {
				contracts: { Synthetix },
				utils: { parseEther },
			} = synthetix.js as SynthetixJS;

			let transaction: ethers.ContractTransaction;

			if (mintMax) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.issueMaxSynths);
				transaction = await Synthetix.issueMaxSynths({
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			} else {
				const gasLimit = getGasEstimateForTransaction(
					[parseEther(amountToMint)],
					Synthetix.estimateGas.issueSynths
				);
				transaction = await Synthetix.issueSynths(parseEther(amountToMint), {
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			}
			if (transaction) {
				setTxHash(transaction.hash);
				setTransactionState(Transaction.WAITING);
				monitorHash({
					txHash: transaction.hash,
					onTxConfirmed: () => setTransactionState(Transaction.SUCCESS),
				});
				setTxModalOpen(false);
			}
		} catch (e) {
			setTransactionState(Transaction.PRESUBMIT);
			setStakingTxError(true);
		}
	};

	const returnPanel = () => {
		let onSubmit;
		let inputValue;
		let isLocked;
		switch (mintType) {
			case MintActionType.MAX:
				const mintAmount = getMintAmount(targetCRatio, unstakedCollateral, SNXRate);
				onMintChange(mintAmount.toString());
				onSubmit = () => handleStake(true);
				inputValue = mintAmount;
				isLocked = true;
				break;
			case MintActionType.CUSTOM:
				onSubmit = () => handleStake(false);
				inputValue = toBigNumber(amountToMint);
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
				txError={stakingTxError}
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
	};

	return <TabContainer>{returnPanel()}</TabContainer>;
};

export default MintTab;
