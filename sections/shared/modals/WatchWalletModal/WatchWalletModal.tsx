import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';

import { MenuModal } from '../common';
import Button from 'components/Button';
import TextInput from 'components/Input/SearchInput';
import { Divider, GridDivCenteredRow } from 'styles/common';
import { ethers } from 'ethers';
import { truncateAddress } from 'utils/formatters/string';
import Trash from 'assets/svg/app/trash.svg';
import Connector from 'containers/Connector';

type WatchWalletModalProps = {
  onDismiss: () => void;
};

const WatchWalletModal: React.FC<WatchWalletModalProps> = ({ onDismiss }) => {
  const { L1DefaultProvider, setWatchedWallet } = Connector.useContainer();
  const { t } = useTranslation();
  const [previouslyWatchedWallets, setPreviouslyWatchedWallets] = useLocalStorage<string[]>(
    LOCAL_STORAGE_KEYS.WATCHED_WALLETS,
    []
  );
  const [duplicatedWatchWallets, setDuplicatedWatchWallets] = useState<string[]>([]);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setDuplicatedWatchWallets(previouslyWatchedWallets);
  }, [previouslyWatchedWallets]);

  const handleWatchWallet = async (watchAddressOrEns: string) => {
    setError(false);
    const isEns = watchAddressOrEns.endsWith('.eth');
    if (ethers.utils.isAddress(watchAddressOrEns) || isEns) {
      let resolvedAddress = watchAddressOrEns;
      if (!previouslyWatchedWallets.find((e) => e === resolvedAddress)) {
        setPreviouslyWatchedWallets([resolvedAddress, ...previouslyWatchedWallets]);
      }

      if (isEns) {
        const address = await L1DefaultProvider.resolveName(watchAddressOrEns);
        if (address) {
          resolvedAddress = address;
          setWatchedWallet(resolvedAddress, resolvedAddress, watchAddressOrEns);
        }
      } else {
        setWatchedWallet(resolvedAddress, resolvedAddress, null);
      }

      onDismiss();
    } else {
      setError(true);
    }
  };

  const removeWatchedWallet = (wallet: string) => {
    const tempArray = previouslyWatchedWallets;
    for (let i = tempArray.length - 1; i >= 0; i--) {
      if (tempArray[i] === wallet) {
        tempArray.splice(i, 1);
      }
    }
    setPreviouslyWatchedWallets([...tempArray]);
    setDuplicatedWatchWallets([...tempArray]);
  };

  useEffect(() => {
    setError(false);
  }, [address]);

  return (
    <StyledMenuModal
      onDismiss={onDismiss}
      isOpen={true}
      title={t('modals.wallet.watch-wallet.title')}
    >
      <WatchWalletContainer>
        <Subtitle>{t('modals.wallet.watch-wallet.subtitle')}</Subtitle>
        <StyledInput
          autoFocus={true}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('modals.wallet.watch-wallet.placeholder')}
        />
        {error ? (
          <StyledButton disabled={true}>{t('modals.wallet.watch-wallet.error')}</StyledButton>
        ) : (
          <StyledButton disabled={address.length === 0} onClick={() => handleWatchWallet(address)}>
            {t('modals.wallet.watch-wallet.action')}
          </StyledButton>
        )}
      </WatchWalletContainer>
      {duplicatedWatchWallets.length > 0 && (
        <>
          <StyledDivider />
          <PreviousAddress>
            <Subtitle style={{ textAlign: 'left' }}>
              {t('modals.wallet.watch-wallet.previous.title', {
                count: duplicatedWatchWallets.length,
              })}
            </Subtitle>
            {duplicatedWatchWallets.map((wallet, i) => (
              <Row key={i}>
                <WalletAddress onClick={() => handleWatchWallet(wallet)}>
                  {wallet.endsWith('.eth') ? wallet : truncateAddress(wallet)}
                </WalletAddress>
                <Trash onClick={() => removeWatchedWallet(wallet)} />
              </Row>
            ))}
          </PreviousAddress>
        </>
      )}
    </StyledMenuModal>
  );
};

const StyledMenuModal = styled(MenuModal)`
  [data-reach-dialog-content] {
    width: 384px;
  }
  .card-body {
    padding: 0;
    text-align: center;
    margin: 0 auto;
  }
`;

const WatchWalletContainer = styled.div`
  padding: 36px 36px;
`;

const PreviousAddress = styled.div`
  padding: 8px 36px;
  padding-bottom: 36px;
`;

const Subtitle = styled.p`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 12px;
`;

const StyledInput = styled(TextInput)`
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  font-size: 12px;
  width: 100%;
  text-align: center;
  margin: 16px 0px;
  margin-bottom: 24px;
`;

const StyledButton = styled(Button).attrs({ variant: 'primary' })`
  text-transform: uppercase;
  width: 100%;
`;

const StyledDivider = styled(Divider)`
  margin: 8px 0px;
`;

const Row = styled(GridDivCenteredRow)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 8px;
  svg {
    grid-column: 3 / 3;
    cursor: pointer;
  }
`;

const WalletAddress = styled.div`
  background: ${(props) => props.theme.colors.navy};
  border: 1px solid ${(props) => props.theme.colors.grayBlue};
  border-radius: 2px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  padding: 8px 16px;
  text-align: left;
  grid-column: 1 / 3;

  &:hover {
    background: ${(props) => props.theme.colors.mediumBlue};
    cursor: pointer;
  }
`;

export default WatchWalletModal;
