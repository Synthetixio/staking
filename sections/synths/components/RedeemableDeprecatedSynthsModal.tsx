import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { Synths } from '@synthetixio/contracts-interface';

import synthetix from 'lib/synthetix';

import BaseModal from 'components/BaseModal';
import { ButtonTransaction } from 'components/Form/common';

import { FlexDivColCentered, FlexDivCentered } from 'styles/common';
import media from 'styles/media';

import { GasLimitEstimate } from 'constants/network';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ModalContent, ModalItemTitle, ModalItemText, NoTextTransform } from 'styles/common';

import { normalizedGasPrice } from 'utils/network';
import { formatCryptoCurrency, formatNumber, toBigNumber } from 'utils/formatters/number';

import { CryptoBalance } from 'queries/walletBalances/types';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import Currency from 'components/Currency';

const RedeemDeprecatedSynthsModal: FC<{
	redeemAmount: BigNumber;
	redeemableDeprecatedSynths: string[];
	redeemBalances: CryptoBalance[];
	onDismiss: () => void;
	onTransferConfirmation: (txHash: string) => void;
}> = ({
	onDismiss,
	onTransferConfirmation,
	redeemAmount,
	redeemableDeprecatedSynths,
	redeemBalances,
}) => {
	const { t } = useTranslation();

	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [txError, setTxError] = useState<string | null>(null);
	const [gasLimit, setGasLimit] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const sUSDBalance =
		synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? toBigNumber(0);

	// useEffect(() => {
	// 	const getGasEstimate = async () => {
	// 		if (!redeemableDeprecatedSynths) return;
	// 		const {
	// 			contracts: { Redeemer },
	// 		} = synthetix.js!;

	// 		try {
	// 			setGasEstimateError(null);
	// 			const gasEstimate = await synthetix.getGasEstimateForTransaction({
	// 				txArgs: [redeemableDeprecatedSynths],
	// 				method: Redeemer.redeemAll,
	// 			});
	// 			setGasLimit(gasEstimate);
	// 		} catch (e) {
	// 			console.log(e.message);
	// 			setGasEstimateError(e.message);
	// 		}
	// 	};
	// 	getGasEstimate();
	// }, [t, redeemableDeprecatedSynths]);

	const handleRedeem = async () => {
		// try {
		// 	const {
		// 		contracts: { Redeemer },
		// 	} = synthetix.js!;
		// 	setTxError(null);
		setTxModalOpen(true);
		// 	const transaction = await Redeemer.redeemAll(redeemableDeprecatedSynths, {
		// 		gasLimit,
		// 		gasPrice: normalizedGasPrice(gasPrice),
		// 	});
		// 	if (transaction) {
		// 		setTxModalOpen(false);
		// 		onTransferConfirmation(transaction.hash);
		// 	}
		// } catch (e) {
		// 	console.log(e);
		// 	setTxError(e.message);
		// }
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
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
					</SettingsContainer>
				</ModalContainer>

				<StyledButtonTransaction size="lg" variant="primary" onClick={handleRedeem}>
					<Trans
						i18nKey="synths.redeemable-deprecated-synths.button-label"
						values={{}}
						components={[<CurrencyKeyStyle />]}
					/>
				</StyledButtonTransaction>

				{gasEstimateError ? <ErrorMessage>{gasEstimateError}</ErrorMessage> : null}
			</Inner>

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txError}
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

const BurnValueContainer: FC<{ balances: CryptoBalance[] }> = ({ balances }) => {
	const { t } = useTranslation();

	const titleLabel = (
		<ValueSelectLabel>{t('synths.redeemable-deprecated-synths.modal-burn-title')}</ValueSelectLabel>
	);

	const balancesLabel = (
		<ValueBalanceTable>
			{balances.map((balance) => (
				<ValueBalanceTableRow key={balance.currencyKey}>
					<div>{balance.currencyKey}</div>
					<div>{formatCryptoCurrency(balance.balance)}</div>
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

const ReceiveValueContainer: FC<{ redeemAmount: BigNumber; sUSDBalance: BigNumber }> = ({
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
		<ValueAmountInput>{formatCryptoCurrency(redeemAmount, { decimals: 2 })}</ValueAmountInput>
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
