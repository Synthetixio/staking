import React, { useEffect, useState } from 'react';

import { TabContainer } from '../common';
import { SYNTHS_MAP } from 'constants/currency';
import { SynthetixJS } from '@synthetixio/js';
import Notify from 'containers/Notify';
import { ethers } from 'ethers';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import synthetix from 'lib/synthetix';
import Staking, { BurnActionType } from 'sections/staking/context/StakingContext';
import BurnTiles from '../BurnTiles';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import StakingInput from '../StakingInput';
import { Transaction } from 'constants/network';
import { getMintAmount } from '../helper';
import { toBigNumber } from 'utils/formatters/number';

const BurnTab: React.FC = () => {
	const { monitorHash } = Notify.useContainer();
	const { amountToBurn, onBurnChange, burnType, onBurnTypeChange } = Staking.useContainer();
	const {
		percentageTargetCRatio,
		debtBalance,
		targetCRatio,
		SNXRate,
		unstakedCollateral,
	} = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [burningTxError, setBurningTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<number>(0);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				const {
					contracts: { Synthetix },
					utils: { parseEther },
				} = synthetix.js as SynthetixJS;
				try {
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
	}, [synthetix, error, amountToBurn]);

	const handleBurn = async (burnToTarget: boolean) => {
		try {
			setBurningTxError(false);
			setTxModalOpen(true);
			const {
				contracts: { Synthetix, Issuer },
				utils: { formatBytes32String, parseEther },
			} = synthetix.js as SynthetixJS;

			if (await Synthetix.isWaitingPeriod(formatBytes32String(SYNTHS_MAP.sUSD)))
				throw new Error('Waiting period for sUSD is still ongoing');
			if (!burnToTarget && !(await Issuer.canBurnSynths(walletAddress)))
				throw new Error('Waiting period to burn is still ongoing');

			let transaction: ethers.ContractTransaction;

			if (burnToTarget) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.burnSynthsToTarget);
				transaction = await Synthetix.burnSynthsToTarget({
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit: gasLimit,
				});
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
					onTxConfirmed: () => setTransactionState(Transaction.SUCCESS),
				});
				setTxModalOpen(false);
			}
		} catch (e) {
			setBurningTxError(true);
		}
	};

	const returnPanel = () => {
		let onSubmit;
		let inputValue;
		let isLocked;
		switch (burnType) {
			case BurnActionType.MAX:
				const burnAmount = debtBalance;
				onBurnChange(burnAmount.toString());
				onSubmit = () => {
					handleBurn(false);
				};
				inputValue = burnAmount;
				isLocked = true;
				break;
			case BurnActionType.TARGET:
				const maxIssuableSynths = getMintAmount(
					targetCRatio,
					unstakedCollateral.toString(),
					SNXRate
				);
				const calculatedTargetBurn = Math.max(debtBalance.minus(maxIssuableSynths).toNumber(), 0);
				onBurnChange(calculatedTargetBurn.toString());
				onSubmit = () => handleBurn(true);
				inputValue = toBigNumber(calculatedTargetBurn);
				isLocked = true;
				break;
			case BurnActionType.CUSTOM:
				onSubmit = () => handleBurn(false);
				inputValue = toBigNumber(amountToBurn);
				isLocked = false;
				break;
			default:
				return <BurnTiles percentageTargetCRatio={percentageTargetCRatio} />;
		}
		return (
			<StakingInput
				onSubmit={onSubmit}
				inputValue={inputValue}
				isLocked={isLocked}
				isMint={false}
				onBack={onBurnTypeChange}
				txError={burningTxError}
				error={error}
				setError={setError}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={gasLimitEstimate}
				setGasPrice={setGasPrice}
				onInputChange={onBurnChange}
				txHash={txHash}
				transactionState={transactionState}
				setTransactionState={setTransactionState}
			/>
		);
	};

	return <TabContainer>{returnPanel()}</TabContainer>;
};

export default BurnTab;
