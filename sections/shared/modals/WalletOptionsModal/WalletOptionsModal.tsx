import { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Svg } from 'react-optimized-image';

import { networkState, truncatedWalletAddressState, walletAddressState } from 'store/wallet';

import CheckIcon from 'assets/svg/app/check.svg';

import Connector from 'containers/Connector';
import Etherscan from 'containers/Etherscan';

import Button from 'components/Button';

import { MenuModal } from '../common';
import {
	ExternalLink,
	GridDivCenteredRow,
	ConnectionDot,
	GridDivCenteredCol,
	Tooltip,
} from 'styles/common';

type WalletOptionsProps = {
	onDismiss: () => void;
};

const CheckButton = ({
	children,
	...buttonProps
}: {
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}) => (
	<StyledButton {...buttonProps}>
		<Svg src={CheckIcon} /> {children}
	</StyledButton>
);

const WalletOptionsModal: FC<WalletOptionsProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
	const {
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		selectedWallet,
	} = Connector.useContainer();

	const { etherscanInstance } = Etherscan.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const network = useRecoilValue(networkState);

	useEffect(() => {
		if (copiedAddress) {
			setInterval(() => {
				setCopiedAddress(false);
			}, 3000); // 3s
		}
	}, [copiedAddress]);

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.wallet.title')}>
			<WalletDetails>
				<SelectedWallet>{selectedWallet}</SelectedWallet>
				<WalletAddress role="button">
					<StyledTooltip
						hideOnClick={false}
						arrow={true}
						placement="bottom"
						content={
							copiedAddress
								? t('modals.wallet.copy-address.copied')
								: t('modals.wallet.copy-address.copy-to-clipboard')
						}
					>
						<span>
							<CopyToClipboard text={walletAddress!} onCopy={() => setCopiedAddress(true)}>
								<span>{truncatedWalletAddress}</span>
							</CopyToClipboard>
						</span>
					</StyledTooltip>
				</WalletAddress>
				<Network>
					<ConnectionDot />
					{network?.name}
				</Network>
			</WalletDetails>
			<Buttons>
				<ExternalLink href={etherscanInstance?.addressLink(walletAddress!)}>
					<CheckButton>{t('common.explorers.etherscan')}</CheckButton>
				</ExternalLink>
				<CheckButton
					onClick={() => {
						onDismiss();
						connectWallet();
					}}
				>
					{t('modals.wallet.change-wallet')}
				</CheckButton>
				<CheckButton
					onClick={() => {
						onDismiss();
						disconnectWallet();
					}}
				>
					{t('modals.wallet.disconnect-wallet')}
				</CheckButton>
				<StyledTooltip
					arrow={true}
					placement="bottom"
					content={t('modals.wallet.available-on-hardware-wallet')}
				>
					<span>
						<CheckButton
							onClick={() => {
								onDismiss();
								switchAccounts();
							}}
							disabled={!isHardwareWallet()}
						>
							{t('modals.wallet.change-accounts')}
						</CheckButton>
					</span>
				</StyledTooltip>
			</Buttons>
		</StyledMenuModal>
	);
};

const StyledMenuModal = styled(MenuModal)`
	[data-reach-dialog-content] {
		width: 384px;
	}
	.card-body {
		padding: 36px;
		text-align: center;
		margin: 0 auto;
	}
`;

const StyledButton = styled(Button).attrs({
	variant: 'outline',
	size: 'xl',
})`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedBold};

	width: 150px;
	display: inline-grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	justify-items: center;

	svg {
		margin-right: 5px;
		color: ${(props) => props.theme.colors.gray};
	}
`;

const WalletDetails = styled.div`
	padding-bottom: 22px;
`;

const SelectedWallet = styled.div`
	padding-bottom: 18px;
`;

const WalletAddress = styled.div`
	grid-gap: 10px;
	padding-bottom: 18px;
	font-family: ${(props) => props.theme.fonts.expanded};
	cursor: pointer;
`;

const Network = styled(GridDivCenteredCol)`
	display: inline-grid;
	grid-gap: 8px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const Buttons = styled(GridDivCenteredRow)`
	grid-gap: 16px;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr;
`;

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

export default WalletOptionsModal;
