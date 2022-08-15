import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { delegateWalletState } from 'store/wallet';

import CopyIcon from 'assets/svg/app/copy.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import WalletIcon from 'assets/svg/app/wallet.svg';
import ArrowsChangeIcon from 'assets/svg/app/arrows-change.svg';
import ExitIcon from 'assets/svg/app/exit.svg';
import CheckIcon from 'assets/svg/app/check.svg';
import SearchIcon from 'assets/svg/app/search.svg';
import Incognito from 'assets/svg/app/incognito.svg';
import DelegateIcon from 'assets/svg/app/delegate.svg';

import BrowserWalletIcon from 'assets/wallet-icons/browserWallet.svg';
import LedgerIcon from 'assets/wallet-icons/ledger.svg';
import TrezorIcon from 'assets/wallet-icons/trezor.svg';
import WalletConnectIcon from 'assets/wallet-icons/walletConnect.svg';
import CoinbaseIcon from 'assets/wallet-icons/coinbase.svg';
import PortisIcon from 'assets/wallet-icons/portis.svg';
import TorusIcon from 'assets/wallet-icons/torus.svg';
import GameStopIcon from 'assets/wallet-icons/gamestop.svg';

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
import { truncateAddress } from 'utils/formatters/string';
import { NetworkIdByName } from '@synthetixio/contracts-interface';

export type WalletOptionsProps = {
  onDismiss: () => void;
  setWatchWalletModalOpened: Dispatch<SetStateAction<boolean>>;
  setDelegateModalOpened: Dispatch<SetStateAction<boolean>>;
};

const getWalletIcon = (walletType?: string | null) => {
  switch (walletType) {
    case 'browser wallet':
      return <BrowserWalletIcon />;
    case 'metamask':
      return <BrowserWalletIcon />;
    case 'trezor':
      return <TrezorIcon />;
    case 'ledger':
      return <LedgerIcon />;
    case 'walletconnect':
      return <WalletConnectIcon />;
    case 'coinbase wallet':
    case 'walletlink':
      return <CoinbaseIcon />;
    case 'portis':
      return <PortisIcon />;
    case 'torus':
      return <TorusIcon />;
    case 'gamestop wallet':
      return <GameStopIcon />;

    default:
      return walletType;
  }
};

const exitIcon = <ExitIcon width="16" />;
const walletIcon = <WalletIcon width="16" />;
const changeIcon = <ArrowsChangeIcon width="16" />;
const searchIcon = <SearchIcon width="16" />;
const delegateIcon = <DelegateIcon width="16" />;

const WalletOptionsModal: FC<WalletOptionsProps> = ({
  onDismiss,
  setWatchWalletModalOpened,
  setDelegateModalOpened,
}) => {
  const { t } = useTranslation();
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const {
    connectWallet,
    disconnectWallet,
    switchAccounts,
    isHardwareWallet,
    walletAddress,
    isWalletConnected,
    walletWatched,
    walletType,
    switchNetwork,
    walletConnectedToUnsupportedNetwork,
    stopWatching,
  } = Connector.useContainer();
  const { blockExplorerInstance } = Etherscan.useContainer();

  const truncatedWalletAddress = walletAddress && truncateAddress(walletAddress);
  const [delegateWallet, setDelegateWallet] = useRecoilState(delegateWalletState);

  useEffect(() => {
    if (copiedAddress) {
      setInterval(() => {
        setCopiedAddress(false);
      }, 3000); // 3s
    }
  }, [copiedAddress]);

  if (walletConnectedToUnsupportedNetwork) {
    return (
      <WalletDetails>
        <Buttons>
          <StyledButton
            onClick={() => {
              switchNetwork(NetworkIdByName.mainnet);
              onDismiss();
            }}
          >
            {t('modals.wallet.network.ethereum')}
          </StyledButton>
          <DividerText>{t('common.wallet.or')}</DividerText>
          <StyledButton
            onClick={() => {
              switchNetwork(NetworkIdByName['mainnet-ovm']);
              onDismiss();
            }}
          >
            {t('modals.wallet.network.optimism')}
          </StyledButton>
        </Buttons>
      </WalletDetails>
    );
  }

  return (
    <>
      {isWalletConnected ? (
        <>
          <WalletDetails>
            {walletWatched ? (
              <SelectedWallet>
                <Incognito />
              </SelectedWallet>
            ) : (
              <SelectedWallet>{getWalletIcon(walletType?.toLowerCase())}</SelectedWallet>
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
                    {copiedAddress ? <CheckIcon width="16" /> : <CopyIcon width="16" />}
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
                    <LinkIcon width="16" />
                  </WrappedExternalLink>
                </LinkContainer>
              </Tooltip>
            </ActionIcons>
          </WalletDetails>
          <StyledDivider />
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
              data-testid="watch-wallet"
            >
              {searchIcon} {t('modals.wallet.watch-wallet.title')}
            </StyledButton>

            <StyledButton
              onClick={() => {
                onDismiss();
                setDelegateModalOpened(true);
              }}
            >
              {delegateIcon} {t('modals.wallet.delegate-mode.menu-title')}
            </StyledButton>
          </Buttons>
          <StyledDivider />
          {delegateWallet && (
            <StyledTextButton
              onClick={() => {
                setDelegateWallet(null);
                onDismiss();
              }}
            >
              {exitIcon} {t('modals.wallet.stop-delegation')}
            </StyledTextButton>
          )}
          {walletWatched ? (
            <StyledTextButton
              onClick={() => {
                onDismiss();
                stopWatching();
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
  width: 100%;
  display: flex;
  justify-content: flex-start;
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
  svg {
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
