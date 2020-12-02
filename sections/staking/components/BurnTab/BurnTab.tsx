import React, { useEffect, useState } from 'react';

import { TabContainer } from '../common';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { SynthetixJS } from '@synthetixio/js';
import Notify from 'containers/Notify';
import { ethers } from 'ethers';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import synthetix from 'lib/synthetix';
import { getMintAmount, getStakingAmount } from '../helper';
import { formatCurrency } from 'utils/formatters/number';
import Staking, { BurnActionType } from 'sections/staking/context/StakingContext';
import BurnTiles from '../BurnTiles';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import Input from '../Input';
import { Transaction } from 'constants/network';

const BurnTab: React.FC = () => {
	const { monitorHash } = Notify.useContainer();
	const { amountToBurn, onBurnChange, burnType, onBurnTypeChange } = Staking.useContainer();
	const { targetCRatio, debtBalance, SNXRate } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [burningTxError, setBurningTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [stakingCurrencyKey] = useState<string>(CRYPTO_CURRENCY_MAP.SNX);
	const [synthCurrencyKey] = useState<string>(SYNTHS_MAP.sUSD);
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

	// const handleMaxBurn = () => {
	// 	setBurnToTarget(false);
	// 	onBurnChange(maxBurnAmount?.toString() || '');
	// };

	// const handleBurnToTarget = () => {
	// 	setBurnToTarget(true);
	// 	const maxIssuableSynths = getMintAmount(targetCRatio, maxCollateral.toString(), SNXRate);
	// 	onBurnChange(Math.max(maxBurnAmount - maxIssuableSynths, 0).toString());
	// };

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
		switch (burnType) {
			case BurnActionType.MAX:
				onSubmit = () => {
					onBurnChange(debtBalance.toString());
					handleBurn(false);
				};
				debtValue = debtBalance.toString();
				stakeValue = stakeInfo(debtBalance.toString());
				isLocked = true;
				break;
			case BurnActionType.TARGET:
				onSubmit = () => handleBurn(true);
				debtValue = '0';
				stakeValue = '0';
				isLocked = true;
				break;
			case BurnActionType.CUSTOM:
				onSubmit = () => handleBurn(false);
				debtValue = amountToBurn;
				stakeValue = stakeInfo(amountToBurn);
				isLocked = false;
				break;
			default:
				return <BurnTiles targetCRatio={targetCRatio} />;
		}
		return (
			<Input
				onSubmit={onSubmit}
				debtValue={debtValue}
				stakeValue={stakeValue}
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
