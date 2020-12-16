import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Img, { Svg } from 'react-optimized-image';

import { networkState, truncatedWalletAddressState, walletAddressState } from 'store/wallet';

import MetaMaskIcon from 'assets/wallet-icons/metamask.png';
import LedgerIcon from 'assets/wallet-icons/ledger.svg';
import TrezorIcon from 'assets/wallet-icons/trezor.svg';
import WalletConnectIcon from 'assets/wallet-icons/walletConnect.svg';
import CoinbaseIcon from 'assets/wallet-icons/coinbase.svg';
import PortisIcon from 'assets/wallet-icons/portis.svg';
import TrustIcon from 'assets/wallet-icons/trust.svg';
import DapperIcon from 'assets/wallet-icons/dapper.png';
import TorusIcon from 'assets/wallet-icons/torus.svg';
import StatusIcon from 'assets/wallet-icons/status.svg';
import AuthereumIcon from 'assets/wallet-icons/authereum.png';

import CopyIcon from 'assets/svg/app/copy.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import ArrowsChangeIcon from 'assets/svg/app/arrows-change.svg';
import ExitIcon from 'assets/svg/app/exit.svg';
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
	FlexDiv,
} from 'styles/common';

type WalletOptionsProps = {
	onDismiss: () => void;
};

const getWalletIcon = (selectedWallet?: string | null) => {
	switch (selectedWallet) {
		case 'metamask':
			return <Img src={MetaMaskIcon} />;
		case 'trezor':
			return <Img src={TrezorIcon} />;
		case 'ledger':
			return <Img src={LedgerIcon} />;
		case 'walletconnect':
			return <Img src={WalletConnectIcon} />;
		case 'coinbase':
		case 'walletlink':
			return <Img src={CoinbaseIcon} />;
		case 'portis':
			return <Img src={PortisIcon} />;
		case 'trust':
			return <Img src={TrustIcon} />;
		case 'dapper':
			return <Img src={DapperIcon} />;
		case 'torus':
			return <Img src={TorusIcon} />;
		case 'status':
			return <Img src={StatusIcon} />;
		case 'authereum':
			return <Img src={AuthereumIcon} />;
		default:
			return selectedWallet;
	}
};

const linkIcon = <Svg src={LinkIcon} />;
const exitIcon = <Svg src={ExitIcon} />;
const changeIcon = <Svg src={ArrowsChangeIcon} />;

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
				<SelectedWallet>{getWalletIcon(selectedWallet?.toLowerCase())}</SelectedWallet>
				<WalletAddress>
					{truncatedWalletAddress}
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
						<CopyClipboardContainer>
							<CopyToClipboard text={walletAddress!} onCopy={() => setCopiedAddress(true)}>
								{copiedAddress ? (
									<Svg
										src={CheckIcon}
										width="16"
										height="16"
										viewBox={`0 0 ${CheckIcon.width} ${CheckIcon.height}`}
									/>
								) : (
									<Svg src={CopyIcon} />
								)}
							</CopyToClipboard>
						</CopyClipboardContainer>
					</StyledTooltip>
				</WalletAddress>
				<Network>
					<ConnectionDot />
					{network?.name}
				</Network>
			</WalletDetails>
			<Buttons>
				<ExternalLink href={etherscanInstance?.addressLink(walletAddress!)}>
					<StyledButton>
						{linkIcon}
						{t('common.explorers.etherscan')}
					</StyledButton>
				</ExternalLink>
				<StyledButton
					onClick={() => {
						onDismiss();
						connectWallet();
					}}
				>
					{changeIcon} {t('modals.wallet.change-wallet')}
				</StyledButton>
				<StyledButton
					onClick={() => {
						onDismiss();
						disconnectWallet();
					}}
				>
					{exitIcon} {t('modals.wallet.disconnect-wallet')}
				</StyledButton>
				<StyledTooltip
					arrow={true}
					placement="bottom"
					content={t('modals.wallet.available-on-hardware-wallet')}
				>
					<span>
						<StyledButton
							onClick={() => {
								onDismiss();
								switchAccounts();
							}}
							disabled={!isHardwareWallet()}
						>
							{changeIcon} {t('modals.wallet.switch-account')}
						</StyledButton>
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
	img {
		width: 44px;
	}
`;

const WalletAddress = styled(GridDivCenteredCol)`
	display: grid;
	justify-content: center;
	align-items: center;
	grid-gap: 10px;
	padding-bottom: 18px;
	font-family: ${(props) => props.theme.fonts.expanded};
`;

const CopyClipboardContainer = styled(FlexDiv)`
	cursor: pointer;
	color: ${(props) => props.theme.colors.gray};
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
