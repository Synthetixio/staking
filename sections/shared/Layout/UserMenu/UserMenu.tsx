import { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import OutsideClickHandler from 'react-outside-click-handler';

import {
  FlexDiv,
  FlexDivCentered,
  FlexDivRow,
  GridDivCenteredCol,
  IconButton,
  UpperCased,
} from 'styles/common';
import { zIndex } from 'constants/ui';
import UI from 'containers/UI';
import Button from 'components/Button';
import { DesktopOnlyView, DesktopOrTabletView, MobileOrTabletView } from 'components/Media';

import { delegateWalletState } from 'store/wallet';

import {
  DesktopWalletOptionsModal,
  MobileWalletOptionsModal,
  StyledGlowingButton,
} from 'sections/shared/modals/WalletOptionsModal';
import SettingsModal from 'sections/shared/modals/SettingsModal';
import ConnectionDot from 'sections/shared/ConnectionDot';

import CogIcon from 'assets/svg/app/cog.svg';
import CaretUp from 'assets/svg/app/caret-up.svg';
import CaretDown from 'assets/svg/app/caret-down.svg';
import Warning from 'assets/svg/app/warning.svg';
import DelegateIcon from 'assets/svg/app/delegate.svg';
import WatchWalletModal from 'sections/shared/modals/WatchWalletModal';
import DelegateModal from 'sections/shared/modals/DelegateModal';
import Connector from 'containers/Connector';
import { truncateAddress } from 'utils/formatters/string';

const UserMenu: FC = () => {
  const { t } = useTranslation();
  const { networkError } = UI.useContainer();

  const { network, ensName, ensAvatar, isWalletConnected, walletAddress, signer } =
    Connector.useContainer();

  const [walletOptionsModalOpened, setWalletOptionsModalOpened] = useState<boolean>(false);
  const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
  const [watchWalletModalOpened, setWatchWalletModalOpened] = useState<boolean>(false);
  const [delegateModalOpened, setDelegateModalOpened] = useState<boolean>(false);

  const truncatedWalletAddress = walletAddress && truncateAddress(walletAddress);

  const delegateWallet = useRecoilValue(delegateWalletState);

  const getNetworkName = () => {
    if (network?.useOvm) {
      return `0Ξ ${network?.name.split('-')[0]}`;
    } else return network?.name;
  };

  return (
    <Container>
      <FlexDivCentered>
        <DesktopOnlyView>
          <FlexDiv>
            {isWalletConnected && delegateWallet && (
              <DelegateIconWrapper>
                <DelegateIcon width="14" />
              </DelegateIconWrapper>
            )}
            <DropdownContainer>
              <OutsideClickHandler onOutsideClick={() => setWalletOptionsModalOpened(false)}>
                {isWalletConnected ? (
                  <WalletButton
                    variant="solid"
                    onClick={() => {
                      setWalletOptionsModalOpened(!walletOptionsModalOpened);
                    }}
                    isActive={walletOptionsModalOpened}
                    data-testid="user-menu"
                  >
                    <FlexDivCentered data-testid="wallet-address">
                      <StyledConnectionDot />
                      <Ens>
                        {ensAvatar && <EnsAvatar alt="" src={ensAvatar} />}
                        {ensName || truncatedWalletAddress}
                      </Ens>
                    </FlexDivCentered>
                    <NetworkTag className="network-tag" data-testid="network-tag">
                      {getNetworkName()}
                    </NetworkTag>
                    {walletOptionsModalOpened ? <CaretUp width="10" /> : <CaretDown width="10" />}
                  </WalletButton>
                ) : (
                  <WalletButton
                    variant="solid"
                    onClick={() => setWalletOptionsModalOpened(!walletOptionsModalOpened)}
                    data-testid="user-menu"
                    disabled={!!networkError}
                  >
                    <FlexDivCentered>
                      <StyledConnectionDot />
                      <UpperCased>
                        {signer
                          ? t('common.wallet.unsupported-network')
                          : t('common.wallet.not-connected')}
                      </UpperCased>
                    </FlexDivCentered>
                    {walletOptionsModalOpened ? <CaretUp width="10" /> : <CaretDown width="10" />}
                  </WalletButton>
                )}
                {walletOptionsModalOpened && (
                  <DesktopWalletOptionsModal
                    onDismiss={() => setWalletOptionsModalOpened(false)}
                    setWatchWalletModalOpened={setWatchWalletModalOpened}
                    setDelegateModalOpened={setDelegateModalOpened}
                  />
                )}
              </OutsideClickHandler>
            </DropdownContainer>
          </FlexDiv>
        </DesktopOnlyView>
        <MobileOrTabletView>
          {isWalletConnected ? (
            <FlexDiv>
              {delegateWallet && (
                <DelegateIconWrapper>
                  <DelegateIcon />
                </DelegateIconWrapper>
              )}
              <WalletButton
                variant="solid"
                onClick={() => {
                  setWalletOptionsModalOpened(!walletOptionsModalOpened);
                }}
                isActive={walletOptionsModalOpened}
                data-testid="user-menu"
              >
                <FlexDivCentered data-testid="wallet-address">
                  <StyledConnectionDot />
                  <Ens>
                    {ensAvatar && <EnsAvatar alt="ensAvatar" src={ensAvatar} />}
                    {ensName || truncatedWalletAddress}
                  </Ens>
                </FlexDivCentered>
                {walletOptionsModalOpened ? <CaretUp width="10" /> : <CaretDown width="10" />}
              </WalletButton>
            </FlexDiv>
          ) : (
            <MobileStyledGlowingButton
              data-testid="connect-wallet"
              onClick={() => setWalletOptionsModalOpened(true)}
            >
              {t('common.wallet.connect-wallet')}
            </MobileStyledGlowingButton>
          )}
          {walletOptionsModalOpened && (
            <MobileWalletOptionsModal
              onDismiss={() => setWalletOptionsModalOpened(false)}
              setWatchWalletModalOpened={setWatchWalletModalOpened}
              setDelegateModalOpened={setDelegateModalOpened}
            />
          )}
        </MobileOrTabletView>
        <DesktopOrTabletView>
          <Menu>
            <MenuButton
              onClick={() => {
                setSettingsModalOpened(!settingsModalOpened);
              }}
            >
              <CogIcon width="18" />
            </MenuButton>
          </Menu>
        </DesktopOrTabletView>
      </FlexDivCentered>
      {watchWalletModalOpened && (
        <WatchWalletModal onDismiss={() => setWatchWalletModalOpened(false)} />
      )}
      {delegateModalOpened && <DelegateModal onDismiss={() => setDelegateModalOpened(false)} />}
      {settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
      {networkError && (
        <Error>
          <ErrorContainer>
            <Warning width="72" />
            {networkError}
          </ErrorContainer>
        </Error>
      )}
    </Container>
  );
};

const DelegateIconWrapper = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.mediumBlue};
  background: ${(props) => props.theme.colors.navy};
  border-radius: 4px;
  padding: 0 8px;
  margin-right: 16px;
`;

const Container = styled(GridDivCenteredCol)`
  grid-gap: 15px;
  position: relative;
`;

const StyledConnectionDot = styled(ConnectionDot)`
  margin-right: 8px;
`;

const Menu = styled.div`
  padding-left: 16px;
  display: grid;
  grid-gap: 10px;
  grid-auto-flow: column;
`;

const Ens = styled.span`
  display: flex;
  align-items: center;
  text-transform: lowercase;
`;

const EnsAvatar = styled.img`
  height: 15px;
  border-radius: 100px;
  margin-right: 5px;
`;

const NetworkTag = styled(FlexDivCentered)`
  background: ${(props) => props.theme.colors.mediumBlue};
  font-size: 10px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  padding: 2px 5px;
  border-radius: 100px;
  height: 18px;
  text-align: center;
  justify-content: center;
  text-transform: uppercase;
`;

const WalletButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.colors.mediumBlue};

  svg {
    margin-left: 5px;
    color: ${(props) => props.theme.colors.gray};
    ${(props) =>
      props.isActive &&
      css`
        color: ${(props) => props.theme.colors.white};
      `}
  }
  &:hover {
    ${NetworkTag} {
      background: ${(props) => props.theme.colors.navy};
    }
  }
`;

const MenuButton = styled(IconButton)`
  border: 1px solid ${(props) => props.theme.colors.mediumBlue};
  color: ${(props) => props.theme.colors.white};
  padding: 7px;
  border-radius: 4px;
  background: ${(props) => props.theme.colors.navy};
  &:hover {
    color: ${(props) => props.theme.colors.white};
  }
  height: 32px;
`;

const DropdownContainer = styled.div`
  width: 185px;
  height: 32px;
  position: relative;

  > div {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: ${zIndex.DROPDOWN};
    width: inherit;
  }
`;

const Error = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  font-size: 12px;
  color: ${(props) => props.theme.colors.pink};
`;

const ErrorContainer = styled(FlexDivRow)`
  align-items: center;

  svg {
    margin-right: 4px;
  }
`;

const MobileStyledGlowingButton = styled(StyledGlowingButton)`
  height: 32px;
  max-height: 32px;
  line-height: unset;
`;

export default UserMenu;
