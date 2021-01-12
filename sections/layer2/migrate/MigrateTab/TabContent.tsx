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
	escrowedAmount: BigNumber;
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
	escrowedAmount,
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
	const vestingCurrencyKey = CryptoCurrency['SNX'];

	const renderButton = () => {
		if (escrowedAmount) {
			return (
				<StyledCTA
					blue={true}
					onClick={onSubmit}
					variant="primary"
					size="lg"
					disabled={transactionState !== Transaction.PRESUBMIT || !!gasEstimateError}
				>
					{t('layer2.actions.migrate.action.deposit-button', {
						escrowedAmount: formatCurrency(vestingCurrencyKey, escrowedAmount, {
							currencyKey: vestingCurrencyKey,
						}),
					})}
				</StyledCTA>
			);
		} else {
			return (
				<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
					{t('layer2.actions.migrate.action.disabled')}
				</StyledCTA>
			);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				action="migrate"
				amount={escrowedAmount.toString()}
				currencyKey={vestingCurrencyKey}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<ActionCompleted
				action="migrate"
				currencyKey={vestingCurrencyKey}
				hash={txHash as string}
				amount={escrowedAmount.toString()}
				setTransactionState={setTransactionState}
			/>
		);
	}

	return (
		<>
			<InputContainer>
				<InputBox>
					<Svg src={SNXLogo} />
					<Data>
						{formatCurrency(vestingCurrencyKey, escrowedAmount, {
							currencyKey: vestingCurrencyKey,
							decimals: 2,
						})}
					</Data>
				</InputBox>
				<SettingsContainer>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				</SettingsContainer>
			</InputContainer>
			{renderButton()}
			<ErrorMessage>{transactionError}</ErrorMessage>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={transactionError}
					attemptRetry={onSubmit}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.vesting.title')}</ModalItemTitle>
								<ModalItemText>
									{formatCurrency(vestingCurrencyKey, escrowedAmount, {
										currencyKey: vestingCurrencyKey,
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
