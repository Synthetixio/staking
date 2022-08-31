import SocketBridge from '../components/SocketBridge';
import Head from 'next/head';
import styled from 'styled-components';
import Connector from '../containers/Connector';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import media from 'styles/media';

const BridgePage = () => {
  const { connectWallet, walletConnectedToUnsupportedNetwork, isWalletConnected } =
    Connector.useContainer();

  const { t } = useTranslation();
  return (
    <Container>
      <Head>
        <title>{t('bridge.page-title')}</title>
      </Head>
      <HeadlineContainer>
        <Headline>{t('bridge.headline')}</Headline>
      </HeadlineContainer>

      {Boolean(walletConnectedToUnsupportedNetwork || isWalletConnected) ? (
        <>
          <SocketBridge />
        </>
      ) : (
        <ConnectWalletContainer>
          <ConnectParagraph>{t('bridge.connect-wallet-text')}</ConnectParagraph>
          <Button variant="primary" onClick={() => connectWallet()}>
            {t('common.wallet.connect-wallet')}
          </Button>
        </ConnectWalletContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding-right: 40px;
  ${media.lessThan('md')`
    padding-left: 40px
  `}
`;

const ConnectWalletContainer = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ConnectParagraph = styled.p`
  margin-bottom: 10px;
`;

const HeadlineContainer = styled.div`
  padding: 20px 0;
`;

const Headline = styled.h1`
  font-size: 24px;
`;
export default BridgePage;
