import React, { useEffect, useState } from 'react';
import { SynthetixJS } from '@synthetixio/js';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';

import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import Notify from 'containers/Notify';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { Transaction } from 'constants/network';

import { TabContainer } from '../common';
import { getMintAmount, getStakingAmount } from '../helper';
import Staking, { MintActionType } from 'sections/staking/context/StakingContext';
import MintTiles from '../MintTiles';
import Input from '../Input';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

const MintTab: React.FC = () => {
	const { monitorHash } = Notify.useContainer();
	const { targetCRatio, SNXRate, unstakedCollateral } = useStakingCalculations();
	const { amountToMint, onMintChange, mintType, onMintTypeChange } = Staking.useContainer();

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [stakingTxError, setStakingTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [stakingCurrencyKey] = useState<string>(CRYPTO_CURRENCY_MAP.SNX);
	const [synthCurrencyKey] = useState<string>(SYNTHS_MAP.sUSD);
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

	/**
	 * Given the amount to mint, returns the equivalent collateral needed for stake.
	 * @param mintInput Amount to mint
	 */
	const stakeInfo = (mintInput: string) =>
		formatCurrency(stakingCurrencyKey, getStakingAmount(targetCRatio, mintInput, SNXRate), {
			currencyKey: stakingCurrencyKey,
		});

	/**
	 * Given the amount to stake, returns the equivalent debt produced. (Estimate)
	 * @param mintInput Amount to mint
	 */
	const mintInfo = (stakeInput: string) =>
		formatCurrency(synthCurrencyKey, getMintAmount(targetCRatio, stakeInput, SNXRate), {
			currencyKey: synthCurrencyKey,
		});

	const returnPanel = () => {
		let onSubmit;
		let debtValue;
		let stakeValue;
		let isLocked;
		switch (mintType) {
			case MintActionType.MAX:
				onSubmit = () => handleStake(true);
				debtValue = mintInfo(unstakedCollateral.toString());
				stakeValue = unstakedCollateral.toString();
				isLocked = true;
				break;
			case MintActionType.CUSTOM:
				onSubmit = () => handleStake(false);
				debtValue = amountToMint;
				stakeValue = stakeInfo(amountToMint);
				isLocked = false;
				break;
			default:
				return <MintTiles />;
		}
		return (
			<Input
				onSubmit={onSubmit}
				debtValue={debtValue}
				stakeValue={stakeValue}
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
