import { FC } from 'react';
import { Svg } from 'react-optimized-image';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { InputContainer, InputBox } from '../../components/common';
import { Transaction } from 'constants/network';

import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ActionCompleted, ActionInProgress } from '../../components/TxSent';

import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { StyledCTA } from '../../components/common';
import {
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
	ErrorMessage,
} from 'styles/common';

type TabContentProps = {
	depositAmount: BigNumber;
	onSubmit: any;
	transactionError: string | null;
	gasEstimateError: string | null;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: number | null;
	setGasPrice: Function;
	txHash: string | null;
	transactionState: Transaction;
	setTransactionState: (tx: Transaction) => void;
};

const TabContent: FC<TabContentProps> = ({
	depositAmount,
	onSubmit,
	transactionError,
	txModalOpen,
	setTxModalOpen,
	gasLimitEstimate,
	gasEstimateError,
	setGasPrice,
	txHash,
	transactionState,
	setTransactionState,
}) => {
	const { t } = useTranslation();
	const currencyKey = CryptoCurrency['SNX'];

	const renderButton = () => {
		if (depositAmount) {
			return (
				<StyledCTA
					blue={true}
					onClick={onSubmit}
					variant="primary"
					size="lg"
					disabled={transactionState !== Transaction.PRESUBMIT || !!gasEstimateError}
				>
					{t('layer2.actions.deposit.action.deposit-button', {
						depositAmount: formatCurrency(currencyKey, depositAmount, {
							currencyKey: currencyKey,
						}),
					})}
				</StyledCTA>
			);
		} else {
			return (
				<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
					{t('layer2.actions.deposit.action.disabled')}
				</StyledCTA>
			);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				amount={depositAmount.toString()}
				currencyKey={currencyKey}
				hash={txHash as string}
				action="deposit"
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<ActionCompleted
				currencyKey={currencyKey}
				hash={txHash as string}
				amount={depositAmount.toString()}
				setTransactionState={setTransactionState}
				action="deposit"
			/>
		);
	}

	return (
		<>
			<InputContainer>
				<InputBox>
					<Svg src={SNXLogo} />
					<Data>
						{formatCurrency(currencyKey, depositAmount, {
							currencyKey: currencyKey,
							decimals: 2,
						})}
					</Data>
				</InputBox>
				<SettingsContainer>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				</SettingsContainer>
			</InputContainer>
			{renderButton()}
			<ErrorMessage>{transactionError || gasEstimateError}</ErrorMessage>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={transactionError}
					attemptRetry={onSubmit}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.deposit.title')}</ModalItemTitle>
								<ModalItemText>
									{formatCurrency(currencyKey, depositAmount, {
										currencyKey: currencyKey,
										decimals: 4,
									})}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const Data = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
`;

const SettingsContainer = styled.div`
	width: 100%;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
	margin-bottom: 16px;
`;

export default TabContent;
