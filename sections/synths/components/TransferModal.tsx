import { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';

import BaseModal from 'components/BaseModal';
import { InputsDivider, ButtonTransaction } from 'components/Form/common';
import AssetInput, { Asset } from 'components/Form/AssetInput';
import TextInput from 'components/Form/TextInput';
import { FlexDivColCentered, FlexDivCentered } from 'styles/common';

import { GasLimitEstimate } from 'constants/network';
import GasSelector from 'components/GasSelector';
import { isSynth, synthToContractName } from 'utils/currencies';
import { CryptoCurrency } from 'constants/currency';
import { formatNumber } from 'utils/formatters/number';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';

import { truncateAddress } from 'utils/formatters/string';
import { normalizedGasPrice } from 'utils/network';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';
import useSynthetixQueries from '@synthetixio/queries';
import { ethers } from 'ethers';

type TransferModalProps = {
	onDismiss: () => void;
	assets: Array<Asset>;
	currentAsset: Asset | null;
	setAsset: (asset: Asset) => void;
	onTransferConfirmation: (txHash: string) => void;
};

const TransferModal: FC<TransferModalProps> = ({
	onDismiss,
	assets,
	setAsset,
	currentAsset,
	onTransferConfirmation,
}) => {
	const { t } = useTranslation();

	const { synthetixjs } = Connector.useContainer();

	const { useContractTxn } = useSynthetixQueries();

	const [amount, setAmount] = useState<string>('');
	const [walletAddress, setWalletAddress] = useState('');
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const onEnterAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
		setWalletAddress((e.target.value ?? '').trim());

	const getTransferFunctionForAsset = useCallback(
		({ isEstimate }: { isEstimate: boolean }) => {
			if (!currentAsset) return;
			if (!isSynth(currentAsset.currencyKey) && currentAsset.currencyKey !== CryptoCurrency.SNX)
				return;
			const { contracts } = synthetixjs!;
			let contract, transferFunction;
			if (isSynth(currentAsset.currencyKey)) {
				contract = contracts[synthToContractName(currentAsset.currencyKey)];
				transferFunction = 'transferAndSettle';
			}
			if (currentAsset.currencyKey === CryptoCurrency.SNX) {
				contract = contracts.Synthetix;
				transferFunction = 'transfer';
			}
			if (!contract || !transferFunction) return;
			return isEstimate ? contract.estimateGas[transferFunction] : contract[transferFunction];
		},
		[currentAsset]
	);

	const contract = synthetixjs!.contracts[
		isSynth(currentAsset?.currencyKey)
			? synthToContractName(currentAsset?.currencyKey || '')
			: 'Synthetix'
	];

	const txn = useContractTxn(
		contract,
		isSynth(currentAsset?.currencyKey) ? 'transferAndSettle' : 'transfer',
		[wei(amount).toBN()]
	);

	useEffect(() => {
		if (txn.txnStatus == 'confirmed') onTransferConfirmation(txn.hash!);
	}, [txn.txnStatus]);

	let error: string | null = null;
	if (!ethers.utils.isAddress(walletAddress)) error = t('synths.transfer.error.invalid-address');
	if (wei(amount).gt(currentAsset?.balance))
		error = t('synths.transfer.error.insufficient-balance');

	const renderButton = () => {
		if (!amount || !Number(amount)) {
			return (
				<StyledButtonTransaction size="lg" variant="primary" disabled={true}>
					{t('synths.transfer.button.no-amount')}
				</StyledButtonTransaction>
			);
		}
		if (!walletAddress) {
			return (
				<StyledButtonTransaction size="lg" variant="primary" disabled={true}>
					{t('synths.transfer.button.no-address')}
				</StyledButtonTransaction>
			);
		}
		return (
			<StyledButtonTransaction
				size="lg"
				variant="primary"
				onClick={() => txn.mutate()}
				disabled={!txn.gasLimit || !!txn.errorMessage}
			>
				<Trans
					i18nKey="synths.transfer.button.transfer"
					values={{
						asset: currentAsset?.currencyKey,
					}}
					components={[<CurrencyKeyStyle />]}
				/>
			</StyledButtonTransaction>
		);
	};

	return (
		<StyledModal onDismiss={onDismiss} isOpen={true} title={t('synths.transfer.modal-title')}>
			<Inner>
				<FormContainer>
					<InputsContainer>
						<AssetInput
							label="synths.transfer.input-label"
							balanceLabel="synths.transfer.balance-label"
							assets={assets}
							asset={currentAsset}
							setAsset={setAsset}
							amount={amount}
							setAmount={setAmount}
							onSetMaxAmount={() => setAmount(currentAsset?.balance?.toString() ?? '')}
						/>
						<InputsDivider />
						<TextInput
							label={t('common.form.to-address')}
							placeholder={t('common.form.address-input-placeholder')}
							value={walletAddress}
							onChange={onEnterAddress}
						/>
					</InputsContainer>
					<SettingsContainer>
						<GasSelector gasLimitEstimate={txn.gasLimit} setGasPrice={setGasPrice} />
					</SettingsContainer>
				</FormContainer>
				{renderButton()}
				{error || txn.errorMessage ? (
					<ErrorMessage>{error || txn.errorMessage}</ErrorMessage>
				) : null}
			</Inner>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error || txn.errorMessage}
					attemptRetry={txn.mutate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>
									{t('modals.confirm-transaction.transfer.transferring')}
								</ModalItemTitle>
								<ModalItemText>
									{formatNumber(amount, {
										suffix: currentAsset?.currencyKey,
									})}
								</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.transfer.to')}</ModalItemTitle>
								<ModalItemText>{truncateAddress(walletAddress)}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</StyledModal>
	);
};

const Inner = styled.div`
	position: relative;
`;

const FormContainer = styled(FlexDivColCentered)`
	justify-content: space-between;
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 26px;
	margin-top: 8px;
`;

const InputsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1px 1fr;
	align-items: center;
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

export default TransferModal;
