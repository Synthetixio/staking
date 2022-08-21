import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { delegateWalletState } from 'store/wallet';
import { truncateAddress } from 'utils/formatters/string';
import useSynthetixQueries, { DelegationWallet } from '@synthetixio/queries';

import { MenuModal } from '../common';
import { Tooltip } from 'styles/common';

import SpinnerIcon from 'assets/svg/app/loader.svg';
import Connector from 'containers/Connector';

type DelegateModalProps = {
  onDismiss: () => void;
};

const DelegateModal: FC<DelegateModalProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const { walletAddress } = Connector.useContainer();

  const { useGetAuthoriserWallets } = useSynthetixQueries();
  const delegateWalletsQuery = useGetAuthoriserWallets(walletAddress || '', {
    enabled: Boolean(walletAddress),
  });

  const [delegateWallet, setDelegateWallet] = useRecoilState(delegateWalletState);

  const authoriserWallets = delegateWalletsQuery?.data ?? null;

  const handleWalletSelect = (wallet: DelegationWallet) => {
    setDelegateWallet(wallet);
    onDismiss();
  };
  return (
    <StyledMenuModal
      onDismiss={onDismiss}
      isOpen={true}
      title={t('modals.wallet.delegate-mode.modal-title')}
    >
      <ModalContainer>
        <Subtitle>{t('modals.wallet.delegate-mode.subtitle')}</Subtitle>
        <ListContainer>
          {authoriserWallets && authoriserWallets.length > 0 ? (
            <WalletList>
              {authoriserWallets.map((wallet) => {
                return (
                  <WalletListElement isSelected={wallet.address === delegateWallet?.address}>
                    <Tooltip content={wallet.address}>
                      <StyledButton onClick={() => handleWalletSelect(wallet)}>
                        {truncateAddress(wallet.address)}
                      </StyledButton>
                    </Tooltip>
                  </WalletListElement>
                );
              })}
            </WalletList>
          ) : delegateWalletsQuery.isFetching ? (
            <StyledSpinner width="38" />
          ) : (
            <Subtitle style={{ fontSize: '12px' }}>
              {t('modals.wallet.delegate-mode.no-delegate')}
            </Subtitle>
          )}
        </ListContainer>
      </ModalContainer>
    </StyledMenuModal>
  );
};

const StyledMenuModal = styled(MenuModal)`
  [data-reach-dialog-content] {
    width: 384px;
  }
  .card-body {
    padding: 24px;
    width: 100%;
    text-align: center;
    margin: 0 auto;
  }
`;

const ModalContainer = styled.div``;

const Subtitle = styled.p`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 14px;
`;

const ListContainer = styled.div`
  margin-top: 24px;
  min-height: 50px;
`;
const StyledButton = styled.button`
  background: none;
  width: 100%;
  font-family: ${(props) => props.theme.fonts.extended};
  color: ${(props) => props.theme.colors.white};
  outline: none;
  border: 0;
  height: 100%;
  padding: 0;
  cursor: pointer;
`;

const WalletList = styled.ul``;

const WalletListElement = styled.li<{ isSelected: boolean }>`
  border: 1px solid ${(props) => props.theme.colors.grayBlue};
  margin-bottom: 8px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  &:hover {
    background: ${(props) => props.theme.colors.mediumBlue};
  }
  background: ${(props) =>
    props.isSelected ? props.theme.colors.mediumBlue : props.theme.colors.backgroundBlue};
`;

const StyledSpinner = styled(SpinnerIcon)`
  display: block;
  margin: 10px auto;
`;

export default DelegateModal;
