import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SynthetixJS } from '@synthetixio/js';
import { ethers } from 'ethers';

import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import Notify from 'containers/Notify';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import synthetix from 'lib/synthetix';
import GasSelector from 'components/GasSelector';
import { Transaction } from 'constants/network';

import {
	TabContainer,
	StyledButton,
	StyledCTA,
	StyledInput,
	DataContainer,
	DataRow,
	InputBox,
	RowTitle,
	RowValue,
} from '../common';
import { getMintAmount } from '../helper';
import { ActionInProgress, ActionCompleted } from '../TxSent';
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import Staking from 'sections/staking/context/StakingContext';

type MintTabProps = {
	maxCollateral: number;
	targetCRatio: number;
	SNXRate: number;
};

const MintTab: FC<MintTabProps> = ({ maxCollateral, targetCRatio, SNXRate }) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const { amountToStake, onStakingChange } = Staking.useContainer();
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
		// eslint-disable-next-line
	}, [synthetix, error]);

	const handleMaxIssuance = () => onStakingChange(maxCollateral.toString());

	const handleStake = async () => {
		try {
			setStakingTxError(false);
			setTxModalOpen(true);
			const {
				contracts: { Synthetix },
				utils: { parseEther },
			} = synthetix.js as SynthetixJS;

			let transaction: ethers.ContractTransaction;

			if (Number(amountToStake) === maxCollateral) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.issueMaxSynths);
				transaction = await Synthetix.issueMaxSynths({
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			} else {
				const gasLimit = getGasEstimateForTransaction(
					[parseEther(amountToStake)],
					Synthetix.estimateGas.issueSynths
				);
				const mintAmount = getMintAmount(targetCRatio, amountToStake, SNXRate);
				transaction = await Synthetix.issueSynths(parseEther(mintAmount.toString()), {
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

	const stakeInfo = formatCurrency(stakingCurrencyKey, amountToStake, {
		currencyKey: stakingCurrencyKey,
	});

	const mintInfo = formatCurrency(
		SYNTHS_MAP.sUSD,
		getMintAmount(targetCRatio, amountToStake, SNXRate),
		{
			currencyKey: SYNTHS_MAP.sUSD,
		}
	);

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress isMint={true} stake={stakeInfo} mint={mintInfo} hash={txHash as string} />
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return <ActionCompleted isMint={true} setTransactionState={setTransactionState} />;
	}
	return (
		<>
			<TabContainer>
				<InputBox>
					<StyledInput
						onChange={(e) => onStakingChange(e.target.value)}
						value={amountToStake}
						disabled={maxCollateral === 0}
					/>
					<StyledButton blue={true} onClick={handleMaxIssuance} variant="outline">
						Max
					</StyledButton>
				</InputBox>
				<DataContainer>
					<DataRow>
						<RowTitle>{t('staking.actions.mint.info.staking')}</RowTitle>
						<RowValue>{stakeInfo}</RowValue>
					</DataRow>
					<DataRow>
						<RowTitle>{t('staking.actions.mint.info.minting')}</RowTitle>
						<RowValue>{mintInfo}</RowValue>
					</DataRow>
				</DataContainer>
				<StyledGasContainer gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				{amountToStake !== '0' && amountToStake !== '' ? (
					<StyledCTA
						blue={true}
						onClick={handleStake}
						variant="primary"
						size="lg"
						disabled={transactionState !== Transaction.PRESUBMIT}
					>
						{t('staking.actions.mint.action.mint', {
							amountToStake: formatCurrency(stakingCurrencyKey, amountToStake, {
								currencyKey: stakingCurrencyKey,
							}),
						})}
					</StyledCTA>
				) : (
					<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
						{t('staking.actions.mint.action.empty')}
					</StyledCTA>
				)}
			</TabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={stakingTxError}
					attemptRetry={handleStake}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.from')}</ModalItemTitle>
								<ModalItemText>
									{formatCurrency(stakingCurrencyKey, amountToStake, {
										currencyKey: stakingCurrencyKey,
										decimals: 4,
									})}
								</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.to')}</ModalItemTitle>
								<ModalItemText>
									{formatCurrency(
										synthCurrencyKey,
										getMintAmount(targetCRatio, amountToStake, SNXRate).toString(),
										{
											currencyKey: synthCurrencyKey,
											decimals: 4,
										}
									)}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const StyledGasContainer = styled(GasSelector)`
	margin: 16px 0px;
	flex-direction: row;
`;

export default MintTab;
