import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Synths } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries, { Balances, DeprecatedSynthBalance } from '@synthetixio/queries';

import BaseModal from 'components/BaseModal';
import { ButtonTransaction } from 'components/Form/common';

import { FlexDivColCentered, FlexDivCentered } from 'styles/common';
import media from 'styles/media';

import Connector from 'containers/Connector';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ModalContent, ModalItemTitle, NoTextTransform } from 'styles/common';

import { formatCryptoCurrency, formatCurrency } from 'utils/formatters/number';

import Currency from 'components/Currency';

const RedeemDeprecatedSynthsModal: FC<{
	redeemAmount: Wei;
	redeemableDeprecatedSynthsAddresses: string[];
	redeemBalances: DeprecatedSynthBalance[];
	synthBalances: Balances | null;
	onDismiss: () => void;
	onRedeemConfirmation: (txHash: string | null) => void;
}> = ({
	onDismiss,
	onRedeemConfirmation,
	redeemAmount,
	redeemableDeprecatedSynthsAddresses,
	redeemBalances,
	synthBalances,
}) => {
	const { t } = useTranslation();
	const { synthetixjs } = Connector.useContainer();

	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const sUSDBalance = synthBalances?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
	const Redeemer = synthetixjs!.contracts.SynthRedeemer;

	const { useContractTxn } = useSynthetixQueries();
	const txn = useContractTxn(Redeemer, 'redeemAll', [redeemableDeprecatedSynthsAddresses], {
		gasPrice: gasPrice.toBN(),
	});

	useEffect(() => {
		switch (txn.txnStatus) {
			// case 'prompting':
			// 	setTxModalOpen(true);
			// 	break;

			// case 'unsent':
			case 'confirmed':
				setTxModalOpen(false);
				onRedeemConfirmation(txn.hash);
				break;
		}
	}, [txn.txnStatus, txn.hash, onRedeemConfirmation]);

	const handleRedeem = async () => {
		setTxModalOpen(true);
		txn.mutate();
	};

	return (
		<StyledModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('synths.redeemable-deprecated-synths.modal-title')}
		>
			<Inner>
				<ModalContainer>
					<ValuesContainer>
						<BurnValueContainer balances={redeemBalances} />
						<ValuesDivider />
						<ReceiveValueContainer redeemAmount={redeemAmount} {...{ sUSDBalance }} />
					</ValuesContainer>
					<SettingsContainer>
						<GasSelector gasLimitEstimate={txn.gasLimit} setGasPrice={setGasPrice} />
					</SettingsContainer>
				</ModalContainer>

				<StyledButtonTransaction size="lg" variant="primary" onClick={handleRedeem}>
					<Trans
						i18nKey="synths.redeemable-deprecated-synths.button-label"
						values={{}}
						components={[<CurrencyKeyStyle />]}
					/>
				</StyledButtonTransaction>

				{txn.error ? <ErrorMessage>{txn.errorMessage}</ErrorMessage> : null}
			</Inner>

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
					attemptRetry={handleRedeem}
					content={
						<ModalContent>
							<ModalItemTitle>
								<Trans
									i18nKey="synths.redeemable-deprecated-synths.tx-modal-redeeming"
									values={{
										amount: formatCryptoCurrency(redeemAmount),
									}}
									components={[<NoTextTransform />, <NoTextTransform />]}
								/>
							</ModalItemTitle>
						</ModalContent>
					}
				/>
			)}
		</StyledModal>
	);
};

const BurnValueContainer: FC<{ balances: DeprecatedSynthBalance[] }> = ({ balances }) => {
	const { t } = useTranslation();

	const titleLabel = (
		<ValueSelectLabel>{t('synths.redeemable-deprecated-synths.modal-burn-title')}</ValueSelectLabel>
	);

	const balancesLabel = (
		<ValueBalanceTable>
			{balances.map((balance) => (
				<ValueBalanceTableRow key={balance.currencyKey}>
					<div>{balance.currencyKey}</div>
					<div>
						{formatCurrency(Synths.sUSD, balance.usdBalance)} {Synths.sUSD}
					</div>
				</ValueBalanceTableRow>
			))}
		</ValueBalanceTable>
	);

	return (
		<ValueContainer>
			{titleLabel}
			{balancesLabel}
		</ValueContainer>
	);
};

const ReceiveValueContainer: FC<{ redeemAmount: Wei; sUSDBalance: Wei }> = ({
	redeemAmount,
	sUSDBalance,
}) => {
	const { t } = useTranslation();

	const titleLabel = (
		<ValueSelectLabel>
			{t('synths.redeemable-deprecated-synths.modal-receive-title')}

			<ValueSelectLabelCurrenciesBlock>
				<Currency.Icon currencyKey={Synths.sUSD} height={'16px'} width={'16px'} />
				{Synths.sUSD}
			</ValueSelectLabelCurrenciesBlock>
		</ValueSelectLabel>
	);

	const amountInput = (
		<ValueAmountInput>{formatCryptoCurrency(redeemAmount, { maxDecimals: 2 })}</ValueAmountInput>
	);

	const balanceLabel = (
		<ValueBalanceLabel>
			{t('balance.input-label')}
			{formatCryptoCurrency(sUSDBalance)}
		</ValueBalanceLabel>
	);

	return (
		<ValueContainer>
			{titleLabel}
			{amountInput}
			{balanceLabel}
		</ValueContainer>
	);
};

const Inner = styled.div`
	position: relative;
`;

const ModalContainer = styled(FlexDivColCentered)`
	justify-content: space-between;
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 26px;
	margin-top: 8px;
`;

const ValuesContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1px 1fr;
	align-items: center;
	width: 100%;

	${media.lessThan('mdUp')`
		display: flex;
		flex-direction: column;
	`}
`;

const ValuesDivider = styled.div`
	background: #161b44;
	height: 92px;
	width: 1px;

	${media.lessThan('mdUp')`
		display: none;
	`}
`;

const ValueContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 12px;
`;

const ValueSelectLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-style: normal;
	font-weight: 500;
	font-size: 12px;
	text-transform: uppercase;
	color: #828295;
	margin-right: 10px;
	display: flex;
	align-items: center;
	height: 24px;
`;

const ValueAmountInput = styled.div`
	padding: 0;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 15px;
`;

const ValueBalanceLabel = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	margin-top: 8px;
`;

const ValueBalanceTable = styled.div`
	width: 100%;
	margin-top: 8px;
	padding-right: 12px;
`;

const ValueBalanceTableRow = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	width: 100%;
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	padding: 8px 0;

	& > div:first-child {
		color: ${(props) => props.theme.colors.gray};
	}

	& > div:last-child {
		text-align: right;
	}
`;

const ValueSelectLabelCurrenciesBlock = styled.div`
	margin-left: 4px;
	padding: 0 4px;
	border: 1px solid ${(props) => props.theme.colors.grayBlue};
	border-radius: 2px;
	display: flex;
	align-items: center;

	& > div {
		display: flex;
	}
`;

const StyledModal = styled(BaseModal)`
	.card-header {
		border-top: 2px solid ${(props) => props.theme.colors.blue};
		font-size: 12px;
		font-family: ${(props) => props.theme.fonts.interBold};
		background-color: ${(props) => props.theme.colors.navy};
		border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
		text-transform: uppercase;
	}
`;

const SettingsContainer = styled(FlexDivCentered)`
	width: 100%;
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
`;

const StyledButtonTransaction = styled(ButtonTransaction)`
	margin: 24px 0 14px 0;
`;

const CurrencyKeyStyle = styled.span`
	text-transform: none;
`;

const ErrorMessage = styled(FlexDivCentered)`
	justify-content: center;
	position: absolute;
	top: calc(100% + 20px);
	width: 100%;
	font-size: 12px;
	color: ${(props) => props.theme.colors.pink};
	font-family: ${(props) => props.theme.fonts.interSemiBold};
`;

export default RedeemDeprecatedSynthsModal;
