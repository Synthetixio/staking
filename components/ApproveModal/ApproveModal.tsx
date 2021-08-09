import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';

import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import LockedIcon from 'assets/svg/app/locked.svg';

import { TokenAllowanceLimit, GasLimitEstimate } from 'constants/network';
import { appReadyState } from 'store/app';
import { isWalletConnectedState } from 'store/wallet';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import Button from 'components/Button';
import {
	ErrorMessage,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import { normalizedGasPrice } from 'utils/network';

import { yearnSNXVault } from 'contracts';
import { SynthetixJS } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';

type ApproveModalProps = {
	description: string;
	onApproved: () => void;
	tokenContract: string;
	contractToApprove: string;
};

const getContractByName = (synthetixjs: SynthetixJS, name: string, signer: any) => {
	const { contracts } = synthetixjs;
	if (name === 'YearnSNXVault') {
		return new ethers.Contract(
			yearnSNXVault.address,
			// @ts-ignore
			yearnSNXVault.abi,
			signer as ethers.Signer
		);
	}
	return contracts[name];
};

const ApproveModal: FC<ApproveModalProps> = ({
	description,
	onApproved,
	tokenContract,
	contractToApprove,
}) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { signer, synthetixjs } = Connector.useContainer();

	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [error, setError] = useState<string | null>(null);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected && tokenContract && contractToApprove) {
				try {
					const {
						utils: { parseEther },
					} = synthetixjs!;
					setError(null);
					const allowance = parseEther(TokenAllowanceLimit.toString());
					const approvedContract = getContractByName(synthetixjs!, contractToApprove, signer);
					const gasLimitEstimate = wei(
						await approvedContract.estimateGas.approve(approvedContract.address, allowance),
						0
					);

					setGasLimitEstimate(gasLimitEstimate);
				} catch (e) {
					console.log(e);
					setError(e.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [isAppReady, isWalletConnected, tokenContract, contractToApprove]);

	const handleApprove = async () => {
		if (gasLimitEstimate) {
			try {
				const {
					contracts,
					utils: { parseEther },
				} = synthetixjs!;
				setIsApproving(true);
				setError(null);
				setTxModalOpen(true);
				const allowance = parseEther(TokenAllowanceLimit.toString());
				const approvedContract = getContractByName(synthetixjs!, contractToApprove, signer);
				const transaction: ethers.ContractTransaction = await contracts[tokenContract].approve(
					approvedContract.address,
					allowance,
					{
						gasPrice: normalizedGasPrice(gasPrice.toNumber()),
						gasLimit: gasLimitEstimate.toBN(),
					}
				);
				if (transaction) {
					monitorTransaction({
						txHash: transaction.hash,
						onTxConfirmed: () =>
							setTimeout(() => {
								onApproved();
							}, 15 * 1000),
					});
					setTxModalOpen(false);
				}
			} catch (e) {
				console.log(e);
				setError(e.message);
				setIsApproving(false);
			}
		}
	};

	const { t } = useTranslation();
	return (
		<>
			<Modal>
				<Layer>
					<Svg src={LockedIcon} />
					<ModalInfo>{description}</ModalInfo>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					<StyledButton
						disabled={isApproving || !gasLimitEstimate}
						onClick={handleApprove}
						size="lg"
						variant="primary"
					>
						{isApproving ? t('common.approve.is-approving') : t('common.approve.approve-contract')}
					</StyledButton>
					<ErrorMessage>{error}</ErrorMessage>
				</Layer>
			</Modal>
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
									{t('modals.confirm-transaction.approve.contract', {
										stakedAsset: contractToApprove,
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

const Modal = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	bottom: 100%;
	opacity: 0.97;
	background: ${(props) => props.theme.colors.black};
	z-index: 10;
`;

const Layer = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	width: 260px;
	margin: 0 auto;
	align-items: center;
	text-align: center;
	flex-direction: column;
`;

const ModalInfo = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-top: 0;
`;

const StyledButton = styled(Button)`
	text-transform: uppercase;
	width: 100%;
`;

export default ApproveModal;
