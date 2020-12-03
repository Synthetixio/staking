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
	}, [synthetix, error]);

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
				const gasLimit = getGasEstimateForTransaction(
					[parseEther(amountToBurn.toString())],
					Synthetix.estimateGas.burnSynths
				);
				transaction = await Synthetix.burnSynths(amountToBurn, {
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			}
			if (transaction) {
				monitorHash({ txHash: transaction.hash });
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
				onSubmit = () => {
					onBurnChange(debtBalance.toString());
					handleBurn(false);
				};
				inputValue = debtBalance.toString();
				isLocked = true;
				break;
			case BurnActionType.TARGET:
				const maxIssuableSynths = getMintAmount(
					targetCRatio,
					unstakedCollateral.toString(),
					SNXRate
				);
				onSubmit = () => handleBurn(true);
				inputValue = Math.max(debtBalance.minus(maxIssuableSynths).toNumber(), 0).toString();
				isLocked = true;
				break;
			case BurnActionType.CUSTOM:
				onSubmit = () => handleBurn(false);
				inputValue = amountToBurn;
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
