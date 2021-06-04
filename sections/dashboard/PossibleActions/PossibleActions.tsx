import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, isL2State } from 'store/wallet';
import { WelcomeLayout, LayoutLayerOne, LayoutLayerTwo } from './Layouts';

const PossibleActions: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const Layout = isL2 ? LayoutLayerTwo : LayoutLayerOne;
	return isWalletConnected ? <Layout /> : <WelcomeLayout />;
};

export default PossibleActions;
