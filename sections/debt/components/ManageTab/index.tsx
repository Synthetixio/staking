import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import HedgeTap from './HedgeTab';

const ManageTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	return (
		<ManageContainer>
			{!walletAddress || !isWalletConnected ? <ConnectWallet /> : <HedgeTap />}
		</ManageContainer>
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
			<h3>{t('debt.actions.hedge.connect')}</h3>
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
