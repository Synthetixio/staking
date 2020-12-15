import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import Img, { Svg } from 'react-optimized-image';
import { ethers } from 'ethers';

import GasSelector from 'components/GasSelector';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import synthetix from 'lib/synthetix';
import Notify from 'containers/Notify';
import Etherscan from 'containers/Etherscan';
import { zIndex } from 'constants/ui';
import LockedIcon from 'assets/svg/app/locked.svg';
import { curvepoolRewards } from 'contracts';
import {
	ExternalLink,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { Transaction, TokenAllowanceLimit } from 'constants/network';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { CurrencyKey, Synths } from 'constants/currency';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import TxState from 'sections/earn/TxState';

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

type ApproveProps = {
	synth: CurrencyKey;
	setShowApproveOverlayModal: (show: boolean) => void;
};

export const getContractAndPoolAddress = (synth: CurrencyKey) => {
	const { contracts } = synthetix.js!;
	if (synth === Synths.iBTC) {
		return {
			contract: contracts.SynthiBTC,
			poolAddress: contracts.StakingRewardsiBTC.address,
		};
	} else if (synth === Synths.iETH) {
		return {
			contract: contracts.SynthiETH,
			poolAddress: contracts.StakingRewardsiETH.address,
		};
	} else if (synth === Synths.sUSD) {
		return {
			contract: contracts.SynthsUSD,
			poolAddress: curvepoolRewards.address,
		};
	} else {
		throw new Error('unrecognizable asset');
	}
};

const Approve: FC<ApproveProps> = ({ synth, setShowApproveOverlayModal }) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const link =
		etherscanInstance != null && txHash != null ? etherscanInstance.txLink(txHash) : undefined;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					setError(null);
					const { contract, poolAddress } = getContractAndPoolAddress(synth);
					let gasEstimate = await getGasEstimateForTransaction(
						[poolAddress, synthetix.js.utils.parseEther(TokenAllowanceLimit.toString())],
						contract.estimateGas.approve
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [synth]);

	const handleApprove = async () => {
		if (synthetix && synthetix.js) {
			try {
				setError(null);
				setTxModalOpen(true);
				const { contract, poolAddress } = getContractAndPoolAddress(synth);

				const allowance = synthetix.js.utils.parseEther(TokenAllowanceLimit.toString());
				const gasLimit = await getGasEstimateForTransaction(
					[poolAddress, allowance],
					contract.estimateGas.approve
				);
				const transaction: ethers.ContractTransaction = await contract.approve(
					poolAddress,
					allowance,
					{
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit,
					}
				);

				if (transaction) {
					setTxHash(transaction.hash);
					setTransactionState(Transaction.WAITING);
					monitorHash({
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
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				description={
					<Trans
						i18nKey="modals.approve.description"
						values={{
							synth,
						}}
						components={[<StyledLink />]}
					/>
				}
				title={t('earn.actions.approve.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>{t('earn.actions.approve.approving')}</GreyHeader>
						<WhiteSubheader>{t('earn.actions.approve.contract', { synth })}</WhiteSubheader>
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
							synth,
						}}
						components={[<StyledLink />]}
					/>
				}
				title={t('earn.actions.approve.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>{t('earn.actions.approve.approving')}</GreyHeader>
						<WhiteSubheader>{t('earn.actions.approve.contract', { synth })}</WhiteSubheader>
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
								synth,
							}}
							components={[<StyledLink />]}
						/>
					</Label>
					<PaddedButton variant="primary" onClick={handleApprove}>
						{t('modals.approve.button')}
					</PaddedButton>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
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
									{t('modals.confirm-transaction.approve.contract', { synth })}
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
	width: 575px;
	height: 390px;
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
