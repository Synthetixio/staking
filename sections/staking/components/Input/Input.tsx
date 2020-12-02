import React from 'react';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';
import NavigationBack from 'assets/svg/app/navigation-back.svg';

import GasSelector from 'components/GasSelector';
import {
	StyledCTA,
	InputBox,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	StyledInput,
} from 'sections/staking/components/common';

import { ActionInProgress, ActionCompleted } from 'sections/staking/components/TxSent';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import { InputContainer, InputLocked } from '../common';
import { Transaction } from 'constants/network';

type InputProps = {
	onSubmit: any;
	debtValue: string;
	stakeValue: string;
	isLocked: boolean;
	isMint: boolean;
	onBack: Function;
	txError: boolean;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: number | null;
	setGasPrice: Function;
	onInputChange: Function;
	txHash: string | null;
	transactionState: Transaction;
	setTransactionState: (tx: Transaction) => void;
};

const Input: React.FC<InputProps> = ({
	onSubmit,
	debtValue,
	stakeValue,
	isLocked,
	isMint,
	onBack,
	txError,
	txModalOpen,
	setTxModalOpen,
	gasLimitEstimate,
	setGasPrice,
	onInputChange,
	txHash,
	transactionState,
	setTransactionState,
}) => {
	const { t } = useTranslation();

	const returnButtonStates = () => {
		// @TODO: Add check for when minting more than they have in collateral
		// Add check for burning more sUSD than they have in debt and synth balance
		if (false) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{t('staking.actions.mint.action.insufficient')}
				</StyledCTA>
			);
		} else if (debtValue.length === 0) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{t('staking.actions.mint.action.empty')}
				</StyledCTA>
			);
		} else {
			return (
				<StyledCTA
					onClick={() => onSubmit()}
					variant="primary"
					size="lg"
					disabled={transactionState !== Transaction.PRESUBMIT}
				>
					{isMint ? t('staking.actions.mint.action.mint') : t('staking.actions.burn.action.burn')}
				</StyledCTA>
			);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				isMint={isMint}
				stake={stakeValue}
				mint={debtValue}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return <ActionCompleted isMint={isMint} setTransactionState={setTransactionState} />;
	}

	return (
		<>
			<InputContainer>
				<IconContainer onClick={() => onBack(null)}>
					<Svg src={NavigationBack} />
				</IconContainer>
				<InputBox>
					<Img width={50} height={50} src={sUSDIcon} />
					{isLocked ? (
						<InputLocked>{debtValue}</InputLocked>
					) : (
						<StyledInput placeholder="0" onChange={(e) => onInputChange(e.target.value)} />
					)}
				</InputBox>
				<DataContainer>
					<DataRow>
						<RowTitle>
							{isMint
								? t('staking.actions.mint.info.staking')
								: t('staking.actions.burn.info.unstaking')}
						</RowTitle>
						<RowValue>{stakeValue}</RowValue>
					</DataRow>
					<DataRow>
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					</DataRow>
				</DataContainer>
			</InputContainer>
			{returnButtonStates()}
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txError}
					attemptRetry={() => onSubmit()}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.from')}</ModalItemTitle>
								<ModalItemText>{stakeValue}</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.to')}</ModalItemTitle>
								<ModalItemText>{debtValue}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const IconContainer = styled.div`
	position: absolute;
	top: 20px;
	left: 20px;
	cursor: pointer;
`;

export default Input;
