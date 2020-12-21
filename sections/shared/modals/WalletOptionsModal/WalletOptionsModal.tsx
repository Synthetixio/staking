import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import OutsideClickHandler from 'react-outside-click-handler';

import Img, { Svg } from 'react-optimized-image';

import {
	isWalletConnectedState,
	truncatedWalletAddressState,
	walletAddressState,
	walletWatchedState,
} from 'store/wallet';

import MetaMaskIcon from 'assets/wallet-icons/metamask.svg';
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
import WalletIcon from 'assets/svg/app/wallet.svg';
import ArrowsChangeIcon from 'assets/svg/app/arrows-change.svg';
import ExitIcon from 'assets/svg/app/exit.svg';
import CheckIcon from 'assets/svg/app/check.svg';
import SearchIcon from 'assets/svg/app/search.svg';
import Incognito from 'assets/svg/app/incognito.svg';

import Connector from 'containers/Connector';
import Etherscan from 'containers/Etherscan';

import Button from 'components/Button';

import {
	ExternalLink,
	GridDivCenteredCol,
	Tooltip,
	FlexDiv,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivCentered,
	Divider,
} from 'styles/common';

type WalletOptionsProps = {
	onDismiss: () => void;
	setWatchWalletModalOpened: Dispatch<SetStateAction<any>>;
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

const exitIcon = <Svg src={ExitIcon} />;
const walletIcon = <Svg src={WalletIcon} />;
const changeIcon = <Svg src={ArrowsChangeIcon} />;
const searchIcon = <Svg src={SearchIcon} />;

const WalletOptionsModal: FC<WalletOptionsProps> = ({ onDismiss, setWatchWalletModalOpened }) => {
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

	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [walletWatched, setWalletWatched] = useRecoilState(walletWatchedState);

	useEffect(() => {
		if (copiedAddress) {
			setInterval(() => {
				setCopiedAddress(false);
			}, 3000); // 3s
		}
	}, [copiedAddress]);

	return (
		<OutsideClickHandler onOutsideClick={(e) => onDismiss()}>
			<StyledMenuModal>
				{isWalletConnected ? (
					<>
						<WalletDetails>
							{walletWatched ? (
								<SelectedWallet>
									<Svg src={Incognito} />
								</SelectedWallet>
							) : (
								<SelectedWallet>{getWalletIcon(selectedWallet?.toLowerCase())}</SelectedWallet>
							)}
							<WalletAddress>{truncatedWalletAddress}</WalletAddress>
							<ActionIcons>
								<Tooltip
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
								</Tooltip>
								<Tooltip
									hideOnClick={false}
									arrow={true}
									placement="bottom"
									content={t('modals.wallet.etherscan')}
								>
									<LinkContainer>
										<WrappedExternalLink href={etherscanInstance?.addressLink(walletAddress!)}>
											<Svg src={LinkIcon} />
										</WrappedExternalLink>
									</LinkContainer>
								</Tooltip>
							</ActionIcons>
						</WalletDetails>
						<Buttons>
							<StyledButton
								onClick={() => {
									onDismiss();
									connectWallet();
								}}
							>
								{walletIcon} {t('modals.wallet.change-wallet')}
							</StyledButton>
							{isHardwareWallet() && (
								<StyledButton
									onClick={() => {
										onDismiss();
										switchAccounts();
									}}
								>
									{changeIcon} {t('modals.wallet.switch-account')}
								</StyledButton>
							)}
							<StyledButton
								onClick={() => {
									onDismiss();
									setWatchWalletModalOpened(true);
								}}
							>
								{searchIcon} {t('modals.wallet.watch-wallet.title')}
							</StyledButton>
						</Buttons>
						<StyledDivider />
						{walletWatched ? (
							<StyledTextButton
								onClick={() => {
									onDismiss();
									setWalletWatched(null);
									setWalletAddress(null);
								}}
							>
								{exitIcon} {t('modals.wallet.stop-watching')}
							</StyledTextButton>
						) : (
							<StyledTextButton
								onClick={() => {
									onDismiss();
									disconnectWallet();
								}}
							>
								{exitIcon} {t('modals.wallet.disconnect-wallet')}
							</StyledTextButton>
						)}
					</>
				) : (
					<WalletDetails>
						<Buttons>
							<StyledGlowingButton onClick={connectWallet}>
								{t('common.wallet.connect-wallet')}
							</StyledGlowingButton>
							<DividerText>{t('common.wallet.or')}</DividerText>
							<StyledButton
								onClick={() => {
									onDismiss();
									setWatchWalletModalOpened(true);
								}}
							>
								{searchIcon} {t('modals.wallet.watch-wallet.title')}
							</StyledButton>
						</Buttons>
					</WalletDetails>
				)}
			</StyledMenuModal>
		</OutsideClickHandler>
	);
};

const StyledMenuModal = styled(FlexDivColCentered)`
	margin-top: 12px;
	background: ${(props) => props.theme.colors.navy};
	border: 1px solid ${(props) => props.theme.colors.mediumBlue};
	padding: 8px 0px;
`;

const StyledGlowingButton = styled(Button).attrs({
	variant: 'secondary',
	size: 'xl',
})`
	width: 150px;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	text-transform: uppercase;
	margin: 2px 0px;
`;

const StyledButton = styled(Button).attrs({
	variant: 'outline',
	size: 'xl',
})`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};

	width: 150px;
	display: inline-grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	justify-items: center;
	text-transform: uppercase;

	margin: 2px 0px;

	svg {
		margin-right: 5px;
		color: ${(props) => props.theme.colors.gray};
	}
`;

const StyledTextButton = styled(Button).attrs({
	variant: 'text',
	size: 'xl',
})`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};

	width: 150px;
	display: inline-grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	justify-items: center;
	text-transform: uppercase;

	svg {
		margin-left: 15px;
		color: ${(props) => props.theme.colors.gray};
	}
`;

const WalletDetails = styled.div`
	padding: 8px 0px;
`;

const SelectedWallet = styled(FlexDivCentered)`
	margin-top: 16px;
	justify-content: center;
	img {
		width: 22px;
	}
`;

const WalletAddress = styled(GridDivCenteredCol)`
	display: grid;
	justify-content: center;
	align-items: center;
	grid-gap: 10px;
	margin: 4px;
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
`;

const ActionIcons = styled(FlexDivCentered)`
	justify-content: center;
`;

const CopyClipboardContainer = styled(FlexDiv)`
	cursor: pointer;
	color: ${(props) => props.theme.colors.gray};
	margin-right: 2px;
	&:hover {
		svg {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const WrappedExternalLink = styled(ExternalLink)`
	display: flex;
	justify-content: center;
	align-items: center;
	max-height: 16px;
`;

const LinkContainer = styled(FlexDiv)`
	cursor: pointer;
	margin-left: 2px;
	svg {
		color: ${(props) => props.theme.colors.gray};
	}
	&:hover {
		svg {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const Buttons = styled(FlexDivCol)`
	margin: 0px 8px;
`;

const StyledDivider = styled(Divider)`
	margin: 8px 0px;
`;

const DividerText = styled.p`
	text-align: center;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
	text-transform: uppercase;
`;

export default WalletOptionsModal;
