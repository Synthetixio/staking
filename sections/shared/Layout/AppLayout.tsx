import { FC, ReactNode, useEffect } from 'react';
import router from 'next/router';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import NotificationContainer from 'constants/NotificationContainer';

import { delegateWalletState } from 'store/wallet';
import Header from './Header';

import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const { isL2 } = Connector.useContainer();

  const { useIsBridgeActiveQuery } = useSynthetixQueries();

  const depositsInactive = !(useIsBridgeActiveQuery().data ?? true); // Deposits are active by default to prevent redirects when status unknown
  const delegateWallet = useRecoilValue(delegateWalletState);

  useEffect(() => {
    if (delegateWallet && router.pathname !== ROUTES.Home) {
      router.push(ROUTES.Home);
    }
  }, [isL2, depositsInactive, delegateWallet]);

  return (
    <>
      <Header />
      <Content>{children}</Content>
      <NotificationContainer />
    </>
  );
};

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export default AppLayout;
