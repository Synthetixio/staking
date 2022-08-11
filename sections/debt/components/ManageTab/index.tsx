import Connector from 'containers/Connector';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';
import HedgeTapMainnet from './HedgeTabMainnet';
import HedgeTabOptimism from './HedgeTabOptimism';

const ManageTab = () => {
	const { walletAddress, isWalletConnected, isMainnet } = Connector.useContainer();

	if (!walletAddress || !isWalletConnected) {
		return (
			<ManageContainer>
				<ConnectOrSwitchNetwork />
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
