import { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import Img, { Svg } from 'react-optimized-image';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import GasSelector from 'components/GasSelector';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import TransactionNotifier from 'containers/TransactionNotifier';
import Etherscan from 'containers/BlockExplorer';
import { zIndex } from 'constants/ui';
import LockedIcon from 'assets/svg/app/locked.svg';
import { curveSusdRewards, curveSusdPoolToken } from 'contracts';
import Connector from 'containers/Connector';
import { EXTERNAL_LINKS } from 'constants/links';
import {
	ExternalLink,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import { Transaction, TokenAllowanceLimit, GasLimitEstimate } from 'constants/network';
import { normalizedGasPrice } from 'utils/network';
import { CurrencyKey } from 'constants/currency';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import TxState from 'sections/earn/TxState';

import { LP } from 'sections/earn/types';

import {
	Label,
	StyledLink,
	StyledButton,
	GreyHeader,
	WhiteSubheader,
	Divider,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	GreyText,
	LinkText,
} from '../../common';
import Color from 'color';
import Wei, { wei } from '@synthetixio/wei';
import { SynthetixJS } from '@synthetixio/contracts-interface';

export const getApprovalContractData = (
	synthetixjs: SynthetixJS,
	stakedAsset: CurrencyKey,
	signer: any
) => {
	if (stakedAsset === LP.CURVE_sUSD) {
		return {
			contract: new ethers.Contract(
				curveSusdPoolToken.address,
				curveSusdPoolToken.abi,
				signer as ethers.Signer
			),
			poolAddress: curveSusdRewards.address,
		};
	} else {
		throw new Error('unrecognizable asset');
	}
};

type ApproveProps = {
	stakedAsset: CurrencyKey;
	setShowApproveOverlayModal: (show: boolean) => void;
};

const Approve: FC<ApproveProps> = ({ stakedAsset, setShowApproveOverlayModal }) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { provider, signer, synthetixjs } = Connector.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const link =
		blockExplorerInstance != null && txHash != null
			? blockExplorerInstance.txLink(txHash)
			: undefined;
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady) {
				try {
					setError(null);
					const { contract } = getApprovalContractData(synthetixjs!, stakedAsset, provider);
					let gasEstimate = wei(contract.estimateGas.approve(), 0);

					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [stakedAsset, provider, isAppReady, synthetixjs]);

	const handleApprove = useCallback(() => {
		async function approve() {
			if (isAppReady) {
				try {
					setError(null);
					setTxModalOpen(true);
					const { contract, poolAddress } = getApprovalContractData(
						synthetixjs!,
						stakedAsset,
						signer
					);

					const allowance = TokenAllowanceLimit;
					const gasLimit = wei(contract.estimateGas.approve(allowance.toBN()));

					const transaction: ethers.ContractTransaction = await contract.approve(
						poolAddress,
						allowance,
						{
							gasPrice: normalizedGasPrice(gasPrice.toNumber()),
							gasLimit,
						}
					);

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: transaction.hash,
							onTxConfirmed: () => setTransactionState(Transaction.SUCCESS),
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setError(e.message);
				}
			}
		}
		approve();
	}, [stakedAsset, signer, gasPrice, monitorTransaction, isAppReady, synthetixjs]);

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				description={
					<Trans
						i18nKey="modals.approve.description"
						values={{
							stakedAsset,
						}}
						components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
					/>
				}
				title={t('earn.actions.approve.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>{t('earn.actions.approve.approving')}</GreyHeader>
						<WhiteSubheader>{t('earn.actions.approve.contract', { stakedAsset })}</WhiteSubheader>
						<Divider />
						<GreyText>{t('earn.actions.tx.notice')}</GreyText>
						<ExternalLink href={link}>
							<LinkText>{t('earn.actions.tx.link')}</LinkText>
						</ExternalLink>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxState
				description={
					<Trans
						i18nKey="modals.approve.description"
						values={{
							stakedAsset,
						}}
						components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
					/>
				}
				title={t('earn.actions.approve.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>{t('earn.actions.approve.approving')}</GreyHeader>
						<WhiteSubheader>{t('earn.actions.approve.contract', { stakedAsset })}</WhiteSubheader>
						<Divider />
						<ButtonSpacer>
							{link ? (
								<ExternalLink href={link}>
									<VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
								</ExternalLink>
							) : null}
							<DismissButton
								variant="secondary"
								onClick={() => {
									setTransactionState(Transaction.PRESUBMIT);
									setShowApproveOverlayModal(false);
								}}
							>
								{t('earn.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</FlexDivColCentered>
				}
			/>
		);
	}

	return (
		<>
			<OverlayContainer title="">
				<InnerContainer>
					<Img src={LockedIcon} />
					<Label>
						<Trans
							i18nKey="modals.approve.description"
							values={{
								stakedAsset,
							}}
							components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
						/>
					</Label>
					<PaddedButton variant="primary" onClick={handleApprove}>
						{t('modals.approve.button')}
					</PaddedButton>
					<GasSelector
						altVersion={true}
						gasLimitEstimate={gasLimitEstimate}
						setGasPrice={setGasPrice}
					/>
				</InnerContainer>
			</OverlayContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleApprove}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.approve.approving')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-transaction.approve.contract', { stakedAsset })}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const OverlayContainer = styled(FlexDivColCentered)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	position: absolute;
	width: calc(100% - 48px);
	height: calc(100% - 24px);
	background: ${(props) => Color(props.theme.colors.black).alpha(0.9).rgb().string()};
`;

const InnerContainer = styled(FlexDivColCentered)`
	width: 300px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	width: 100%;
`;

export default Approve;
