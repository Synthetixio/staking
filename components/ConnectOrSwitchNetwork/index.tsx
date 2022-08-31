import React from 'react';
import styled from 'styled-components';
import Connector from '../../containers/Connector';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { NetworkIdByName } from '@synthetixio/contracts-interface';

const ConnectOrSwitchNetwork: React.FC = () => {
  const { connectWallet, isWalletConnected, switchNetwork, walletConnectedToUnsupportedNetwork } =
    Connector.useContainer();
  const { t } = useTranslation();

  if (walletConnectedToUnsupportedNetwork) {
    return (
      <>
        <P>{t('common.wallet.switch-to-supported')}</P>
        <ButtonContainer>
          <StyledCTA
            variant="primary"
            size="lg"
            onClick={() => {
              switchNetwork(NetworkIdByName['mainnet']);
            }}
          >
            {t('modals.wallet.network.ethereum')}
          </StyledCTA>
          <StyledCTA
            variant="primary"
            size="lg"
            onClick={() => {
              switchNetwork(NetworkIdByName['mainnet-ovm']);
            }}
          >
            {t('modals.wallet.network.optimism')}
          </StyledCTA>
        </ButtonContainer>
      </>
    );
  }
  if (!isWalletConnected) {
    return (
      <ButtonContainer>
        <StyledCTA variant="primary" size="lg" onClick={() => connectWallet()}>
          {t('common.wallet.connect-wallet')}
        </StyledCTA>
      </ButtonContainer>
    );
  }
  return null;
};

const P = styled.p`
  text-align: center;
  color: white;
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  font-size: 14px;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const StyledCTA = styled(Button)`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
  border-radius: 4px;
  width: 100%;
  max-width: 200px;
  text-transform: uppercase;
  margin: 0 10px;

  &:disabled {
    box-shadow: none;
  }
`;

export default ConnectOrSwitchNetwork;
