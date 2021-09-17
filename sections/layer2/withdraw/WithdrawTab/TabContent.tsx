import { FC } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { formatCurrency, formatNumber } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { GasLimitEstimate } from 'constants/network';

import { StyledInput } from 'sections/staking/components/common';
import { InputContainer, InputBox, StyledCTA } from '../../components/common';
import { ActionCompleted, ActionInProgress } from '../../components/TxSent';
import GasSelector from 'components/GasSelector';
import Currency from 'components/Currency';
import Button from 'components/Button';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { isWalletConnectedState } from 'store/wallet';

import {
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
	ErrorMessage,
	FlexDivRowCentered,
} from 'styles/common';
import { parseSafeWei } from 'utils/parse';

type TabContentProps = {
	inputValue: string;
	onInputChange: Function;
	transferableCollateral: Wei;
	onSubmit: any;
	transactionError: string | null;
	gasEstimateError: string | null;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: GasLimitEstimate;
	setGasPrice: Function;
	txHash: string | null;
	transactionState: string;
	resetTransaction: () => void;
	bridgeInactive?: boolean;
};

const TabContent: FC<TabContentProps> = ({
	inputValue,
	onInputChange,
	transferableCollateral,
	onSubmit,
	transactionError,
	txModalOpen,
	setTxModalOpen,
	gasLimitEstimate,
	gasEstimateError,
	setGasPrice,
	txHash,
	transactionState,
	resetTransaction,
	bridgeInactive,
}) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const currencyKey = CryptoCurrency['SNX'];

	const inputValueWei = parseSafeWei(inputValue, wei(0));

	const renderButton = () => {
		if (
			isWalletConnected &&
			inputValueWei &&
			inputValueWei.gt(0) &&
			inputValueWei.lte(transferableCollateral)
		) {
			return (
				<StyledCTA
					blue={true}
					onClick={onSubmit}
					variant="primary"
					size="lg"
					disabled={bridgeInactive || transactionState !== 'unsent' || !!gasEstimateError}
				>
					{t('layer2.actions.withdraw.action.withdraw-button', {
						withdrawAmount: formatCurrency(currencyKey, inputValue, {
							currencyKey: currencyKey,
						}),
					})}
				</StyledCTA>
			);
		} else {
			return (
				<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
					{t('layer2.actions.withdraw.action.disabled')}
				</StyledCTA>
			);
		}
	};

	if (transactionState === 'pending') {
		return (
			<ActionInProgress
				amount={inputValue.toString()}
				currencyKey={currencyKey}
				hash={txHash as string}
				action="deposit"
			/>
		);
	}

	if (transactionState === 'confirmed') {
		return (
			<ActionCompleted
				currencyKey={currencyKey}
				hash={txHash as string}
				amount={inputValue.toString()}
				resetTransaction={resetTransaction}
				action="deposit"
			/>
		);
	}

	return (
		<>
			<InputContainer>
				<HeaderRow>
					<BalanceButton variant="text" onClick={() => onInputChange(transferableCollateral)}>
						<Trans
							i18nKey="common.wallet.transferable"
							values={{ transferable: formatNumber(transferableCollateral ?? wei(0)) }}
							components={[<BalanceButtonHeading />]}
						/>
					</BalanceButton>
				</HeaderRow>
				<InputBox>
					<Currency.Icon currencyKey={CryptoCurrency.SNX} width="50" height="50" />
					<StyledInput
						type="number"
						maxLength={12}
						value={inputValue.toString()}
						placeholder="0"
						onChange={(e) => onInputChange(e.target.value)}
						disabled={!isWalletConnected || !transferableCollateral || transferableCollateral.eq(0)}
					/>
				</InputBox>
				<SettingsContainer>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				</SettingsContainer>
			</InputContainer>
			{renderButton()}
			<ErrorMessage>{bridgeInactive && t('layer2.actions.withdraw.bridge-inactive')}</ErrorMessage>
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
									{formatCurrency(currencyKey, inputValue, {
										currencyKey: currencyKey,
										minDecimals: 4,
										maxDecimals: 4,
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

const HeaderRow = styled(FlexDivRowCentered)`
	justify-content: flex-end;
	width: 100%;
	padding: 8px;
`;

const SettingsContainer = styled.div`
	width: 100%;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
	margin-bottom: 16px;
`;

const BalanceButton = styled(Button)`
	background-color: ${(props) => props.theme.colors.navy};
	border-radius: 100px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	text-transform: uppercase;

	padding: 0px 16px;
`;

const BalanceButtonHeading = styled.span`
	color: ${(props) => props.theme.colors.gray};
`;

export default TabContent;
