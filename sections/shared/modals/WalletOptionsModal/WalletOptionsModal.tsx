import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useMediaQuery from 'hooks/useMediaQuery';

import Img, { Svg } from 'react-optimized-image';

import {
	isWalletConnectedState,
	truncatedWalletAddressState,
	walletAddressState,
	walletWatchedState,
} from 'store/wallet';

import BrowserWalletIcon from 'assets/wallet-icons/browserWallet.png';
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
import Etherscan from 'containers/BlockExplorer';

import Button from 'components/Button';

import {
	ExternalLink,
	Tooltip,
	FlexDiv,
	FlexDivCol,
	FlexDivCentered,
	Divider,
} from 'styles/common';

export type WalletOptionsProps = {
	onDismiss: () => void;
	setWatchWalletModalOpened: Dispatch<SetStateAction<any>>;
};

const getWalletIcon = (selectedWallet?: string | null) => {
	switch (selectedWallet) {
		case 'browser wallet':
			return <Img src={BrowserWalletIcon} />;
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
	const { blockExplorerInstance } = Etherscan.useContainer();
	const isSM = useMediaQuery('sm');

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
		<>
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
									<WrappedExternalLink href={blockExplorerInstance?.addressLink(walletAddress!)}>
										<Svg src={LinkIcon} />
									</WrappedExternalLink>
								</LinkContainer>
							</Tooltip>
						</ActionIcons>
					</WalletDetails>
					<StyledDivider />
					<Buttons>
						{isSM ? null : (
							<StyledButton
								onClick={() => {
									onDismiss();
									connectWallet();
								}}
							>
								{walletIcon} {t('modals.wallet.change-wallet')}
							</StyledButton>
						)}
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
						<StyledGlowingButton
							onClick={() => {
								onDismiss();
								connectWallet();
							}}
							data-testid="connect-wallet"
						>
							{t('common.wallet.connect-wallet')}
						</StyledGlowingButton>
						<DividerText>{t('common.wallet.or')}</DividerText>
						<StyledButton
							onClick={() => {
								onDismiss();
								setWatchWalletModalOpened(true);
							}}
							data-testid="watch-wallet"
						>
							{searchIcon} {t('modals.wallet.watch-wallet.title')}
						</StyledButton>
					</Buttons>
				</WalletDetails>
			)}
		</>
	);
};

export const StyledGlowingButton = styled(Button).attrs({
	variant: 'secondary',
	size: 'lg',
})`
	padding: 0 20px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	text-transform: uppercase;
	margin: 4px 0px;
`;

const StyledButton = styled(Button).attrs({
	variant: 'outline',
	size: 'lg',
})`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	padding: 0 20px;
	display: inline-grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	justify-items: center;
	text-transform: uppercase;

	margin: 6px 0px;

	svg {
		margin-right: 5px;
		color: ${(props) => props.theme.colors.gray};
	}
`;

const StyledTextButton = styled(Button).attrs({
	variant: 'text',
	size: 'lg',
})`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	padding: 0 20px;
	display: inline-grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	justify-items: center;
	text-transform: uppercase;
	margin: -2px 0 6px 0;

	svg {
		margin-right: 5px;
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

const WalletAddress = styled.div`
	margin: 6px;
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
