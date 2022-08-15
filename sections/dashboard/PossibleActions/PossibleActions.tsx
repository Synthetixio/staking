import Connector from 'containers/Connector';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { delegateWalletState } from 'store/wallet';
import { WelcomeLayout, LayoutLayerOne, LayoutLayerTwo, LayoutDelegate } from './Layouts';

const PossibleActions: FC = () => {
  const delegateWallet = useRecoilValue(delegateWalletState);

  const { isL2, isWalletConnected } = Connector.useContainer();
  const Layout = delegateWallet ? LayoutDelegate : isL2 ? LayoutLayerTwo : LayoutLayerOne;
  return isWalletConnected ? <Layout /> : <WelcomeLayout />;
};

export default PossibleActions;
