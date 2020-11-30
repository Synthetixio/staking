import React, { FC, useEffect, useMemo, useState } from 'react';
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
import Img, { Svg } from 'react-optimized-image';

import {
	TabContainer,
	StyledCTA,
	StyledInput,
	DataContainer,
	DataRow,
	InputBox,
	RowTitle,
	RowValue,
	InputContainer,
	InputLocked,
} from '../common';
import { getMintAmount, getStakingAmount } from '../helper';
import { ActionInProgress, ActionCompleted } from '../TxSent';
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import Staking, { MintActionType } from 'sections/staking/context/StakingContext';
import MintTiles from '../MintTiles';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';

type MintTabProps = {
	maxCollateral: number;
	targetCRatio: number;
	SNXRate: number;
};

const MintTab: FC<MintTabProps> = ({ maxCollateral, targetCRatio, SNXRate }) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const { amountToMint, onStakingChange, mintType, onMintTypeChange } = Staking.useContainer();
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

			if (Number(amountToMint) === maxCollateral) {
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

	const stakeInfo = formatCurrency(
		stakingCurrencyKey,
		getStakingAmount(targetCRatio, amountToMint, SNXRate),
		{
			currencyKey: stakingCurrencyKey,
		}
	);

	const mintInfo = (stakingInput: string) =>
		formatCurrency(synthCurrencyKey, getMintAmount(targetCRatio, stakingInput, SNXRate), {
			currencyKey: synthCurrencyKey,
		});

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				isMint={true}
				stake={stakeInfo}
				mint={mintInfo(amountToMint)}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return <ActionCompleted isMint={true} setTransactionState={setTransactionState} />;
	}

	const returnInput = (max: boolean) => {
		return (
			<>
				<InputContainer>
					<IconContainer onClick={() => onMintTypeChange(null)}>
						<Svg src={NavigationBack} />
					</IconContainer>
					<InputBox>
						<Img width={50} height={50} src={sUSDIcon} />
						{max ? (
							<InputLocked>{mintInfo(maxCollateral.toString())}</InputLocked>
						) : (
							<StyledInput placeholder="0" onChange={(e) => onStakingChange(e.target.value)} />
						)}
					</InputBox>
					<DataContainer>
						<DataRow>
							<RowTitle>{t('staking.actions.mint.info.staking')}</RowTitle>
							<RowValue>{stakeInfo}</RowValue>
						</DataRow>
						<DataRow>
							<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
						</DataRow>
					</DataContainer>
				</InputContainer>
				{max ? (
					maxCollateral > 0 ? (
						<StyledCTA
							blue={true}
							onClick={handleStake}
							variant="primary"
							size="lg"
							disabled={transactionState !== Transaction.PRESUBMIT}
						>
							{t('staking.actions.mint.action.mint', {
								amountFromMint: mintInfo(amountToMint),
							})}
						</StyledCTA>
					) : (
						<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
							{t('staking.actions.mint.action.insufficient')}
						</StyledCTA>
					)
				) : amountToMint.length > 0 ? (
					<StyledCTA
						blue={true}
						onClick={handleStake}
						variant="primary"
						size="lg"
						disabled={transactionState !== Transaction.PRESUBMIT}
					>
						{t('staking.actions.mint.action.mint', {
							amountFromMint: mintInfo(amountToMint),
						})}
					</StyledCTA>
				) : (
					<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
						{t('staking.actions.mint.action.empty')}
					</StyledCTA>
				)}
			</>
		);
	};

	const returnPanel = useMemo(() => {
		switch (mintType) {
			case MintActionType.MAX:
				return returnInput(true);
			case MintActionType.CUSTOM:
				return returnInput(false);
			default:
				return <MintTiles />;
		}
	}, [mintType, amountToMint]);

	return (
		<TabContainer>
			{returnPanel}
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={stakingTxError}
					attemptRetry={handleStake}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.from')}</ModalItemTitle>
								<ModalItemText>{stakeInfo}</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.to')}</ModalItemTitle>
								<ModalItemText>{mintInfo(amountToMint)}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</TabContainer>
	);
};

const IconContainer = styled.div`
	position: absolute;
	top: 20px;
	left: 20px;
	cursor: pointer;
`;

export default MintTab;
