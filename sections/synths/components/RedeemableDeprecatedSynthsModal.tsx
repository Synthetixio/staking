import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { Synths } from '@synthetixio/contracts-interface';

import BaseModal from 'components/BaseModal';
import { ButtonTransaction } from 'components/Form/common';
import { FlexDivColCentered, FlexDivCentered } from 'styles/common';

import { GasLimitEstimate } from 'constants/network';
import GasSelector from 'components/GasSelector';
import synthetix from 'lib/synthetix';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';

import { normalizedGasPrice } from 'utils/network';
import { formatNumber } from 'utils/formatters/number';

const RedeemDeprecatedSynthsModal: FC<{
	redeemAmount: BigNumber;
	redeemableDeprecatedSynths: string[];
	onDismiss: () => void;
	onTransferConfirmation: (txHash: string) => void;
}> = ({ onDismiss, onTransferConfirmation, redeemAmount, redeemableDeprecatedSynths }) => {
	const { t } = useTranslation();

	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [txError, setTxError] = useState<string | null>(null);
	const [gasLimit, setGasLimit] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const getGasEstimate = async () => {
			if (!redeemableDeprecatedSynths) return;
			const {
				contracts: { Redeemer },
			} = synthetix.js!;

			try {
				setGasEstimateError(null);
				const gasEstimate = await synthetix.getGasEstimateForTransaction({
					txArgs: [redeemableDeprecatedSynths],
					method: Redeemer.redeemAll,
				});
				setGasLimit(gasEstimate);
			} catch (e) {
				console.log(e.message);
				setGasEstimateError(e.message);
			}
		};
		getGasEstimate();
	}, [t, redeemableDeprecatedSynths]);

	const handleRedeem = async () => {
		try {
			const {
				contracts: { Redeemer },
			} = synthetix.js!;
			setTxError(null);
			setTxModalOpen(true);
			const transaction = await Redeemer.redeemAll(redeemableDeprecatedSynths, {
				gasLimit,
				gasPrice: normalizedGasPrice(gasPrice),
			});
			if (transaction) {
				setTxModalOpen(false);
				onTransferConfirmation(transaction.hash);
			}
		} catch (e) {
			console.log(e);
			setTxError(e.message);
		}
	};

	return (
		<StyledModal onDismiss={onDismiss} isOpen={true} title={t('synths.transfer.modal-title')}>
			<Inner>
				<FormContainer>
					<InputsContainer>Redeeming...</InputsContainer>
					<SettingsContainer>
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
					</SettingsContainer>
				</FormContainer>

				<StyledButtonTransaction
					size="lg"
					variant="primary"
					onClick={handleRedeem}
					disabled={!gasLimit || !!gasEstimateError}
				>
					<Trans
						i18nKey="synths.transfer.button.transfer"
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
							<ModalItem>
								<ModalItemTitle>
									{t('modals.confirm-transaction.transfer.transferring')}
								</ModalItemTitle>
								<ModalItemText>
									{formatNumber(redeemAmount, {
										suffix: Synths.sUSD,
									})}
								</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.transfer.to')}</ModalItemTitle>
								<ModalItemText>x</ModalItemText>
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

export default RedeemDeprecatedSynthsModal;
