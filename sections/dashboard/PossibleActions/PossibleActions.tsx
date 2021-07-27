import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, isL2State, delegateWalletState } from 'store/wallet';
import { WelcomeLayout, LayoutLayerOne, LayoutLayerTwo, LayoutDelegate } from './Layouts';

const PossibleActions: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const isL2 = useRecoilValue(isL2State);
	const Layout = delegateWallet ? LayoutDelegate : isL2 ? LayoutLayerTwo : LayoutLayerOne;
	return isWalletConnected ? <Layout /> : <WelcomeLayout />;
};

export default PossibleActions;
