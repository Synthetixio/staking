import { FC, useState, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { formatCurrency, toBigNumber } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { InputContainer, InputBox } from '../../components/common';
import { Transaction, GasLimitEstimate } from 'constants/network';

import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ActionCompleted, ActionInProgress } from '../../components/TxSent';

import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { StyledCTA, StyledInput } from '../../components/common';
import {
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
	ErrorMessage,
} from 'styles/common';

type TabContentProps = {
	transferableCollateral: BigNumber;
	depositAmount: string;
	setDepositAmount: (depositAmount: string) => void;
	onSubmit: any;
	transactionError: string | null;
	gasEstimateError: string | null;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: GasLimitEstimate;
	setGasPrice: Function;
	txHash: string | null;
	transactionState: Transaction;
	setTransactionState: (tx: Transaction) => void;
};

const TabContent: FC<TabContentProps> = ({
	transferableCollateral,
	depositAmount,
	setDepositAmount,
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
	const [isDefault, setDefault] = useState(true);

	const returnPanel = useMemo(() => {
		return (
			<StyledInput
				type="number"
				maxLength={12}
				value={isDefault ? transferableCollateral.toString() : depositAmount}
				placeholder="0"
				onChange={(e) => {
					setDepositAmount(e.target.value);
					setDefault(false);
				}}
			/>
		);
	}, [depositAmount, transferableCollateral, setDepositAmount, isDefault]);

	const renderButton = () => {
		let inputValue: BigNumber;
		if (isDefault) {
			inputValue = transferableCollateral;
		} else {
			inputValue = toBigNumber(depositAmount);
		}

		if (inputValue && !inputValue.isZero() && !inputValue.isNaN()) {
			return (
				<StyledCTA
					blue={true}
					onClick={onSubmit}
					variant="primary"
					size="lg"
					disabled={transactionState !== Transaction.PRESUBMIT || !!gasEstimateError}
				>
					{t('layer2.actions.deposit.action.deposit-button', {
						depositAmount: formatCurrency(currencyKey, inputValue, {
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
				amount={depositAmount}
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
				amount={depositAmount}
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
					{returnPanel}
					{/* <Data>
						{formatCurrency(currencyKey, depositAmount, {
							currencyKey: currencyKey,
							decimals: 2,
						})}
					</Data> */}
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

// const Data = styled.p`
// 	color: ${(props) => props.theme.colors.white};
// 	font-family: ${(props) => props.theme.fonts.extended};
// 	font-size: 24px;
// `;

const SettingsContainer = styled.div`
	width: 100%;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
	margin-bottom: 16px;
`;

export default TabContent;
