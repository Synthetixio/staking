import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivColCentered } from 'styles/common';
import { MenuModal } from '../common';
import Modal, {
  WalletOptionsProps,
  StyledGlowingButton as _StyledGlowingButton,
} from './WalletOptionsModal';

export const StyledGlowingButton = _StyledGlowingButton;

export const DesktopWalletOptionsModal: FC<WalletOptionsProps> = ({
  onDismiss,
  setWatchWalletModalOpened,
  setDelegateModalOpened,
}) => {
  const { t } = useTranslation();

  return (
    <DesktopStyledMenuModal title={t('modals.wallet.watch-wallet.title')}>
      <Modal
        {...{
          onDismiss,
          setWatchWalletModalOpened,
          setDelegateModalOpened,
        }}
      />
    </DesktopStyledMenuModal>
  );
};

export const MobileWalletOptionsModal: FC<WalletOptionsProps> = ({
  onDismiss,
  setWatchWalletModalOpened,
  setDelegateModalOpened,
}) => {
  const { t } = useTranslation();
  return (
    <MobileStyledMenuModal
      {...{ onDismiss }}
      isOpen={true}
      title={t('modals.wallet.wallet-options.title')}
    >
      <Modal
        {...{
          onDismiss,
          setWatchWalletModalOpened,
          setDelegateModalOpened,
        }}
      />
    </MobileStyledMenuModal>
  );
};

const DesktopStyledMenuModal = styled(FlexDivColCentered)`
  margin-top: 12px;
  background: ${(props) => props.theme.colors.navy};
  border: 1px solid ${(props) => props.theme.colors.mediumBlue};
  border-radius: 4px;
`;

const MobileStyledMenuModal = styled(MenuModal)`
  [data-reach-dialog-content] {
    width: 384px;
  }
  .card-body {
    padding: 24px 0;
    text-align: center;
    margin: 0 auto;
  }
`;
