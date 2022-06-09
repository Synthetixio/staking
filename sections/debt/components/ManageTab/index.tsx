import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isMainnetState, isWalletConnectedState, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import HedgeTapMainnet from './HedgeTabMainnet';
import HedgeTabOptimism from './HedgeTabOptimism';

const ManageTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isMainnet = useRecoilValue(isMainnetState);
	if (!walletAddress || !isWalletConnected) {
		return (
			<ManageContainer>
				<ConnectWallet />
			</ManageContainer>
		);
	}
	return (
		<ManageContainer>{isMainnet ? <HedgeTapMainnet /> : <HedgeTabOptimism />}</ManageContainer>
	);
};

const ManageContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: center;
	background: ${(props) => props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.mutedGray};
`;

export default ManageTab;

const ConnectWallet = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	return (
		<WrapperContainer>
			<Button variant="primary" onClick={connectWallet}>
				{t('common.wallet.connect-wallet')}
			</Button>
		</WrapperContainer>
	);
};

const WrapperContainer = styled.div`
	margin-top: 200px;
	display: flex;
	height: 100%;
	align-items: center;
	flex-direction: column;
`;
