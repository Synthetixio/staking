import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';

import { FlexDivCentered, ConnectionDot, IconButton } from 'styles/common';

import Connector from 'containers/Connector';

import Button from 'components/Button';
import { isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';
import SettingsModal from 'sections/shared/modals/SettingsModal';

import CogIcon from 'assets/svg/app/cog.svg';

const UserMenu: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();
	const [walletOptionsModalOpened, setWalletOptionsModalOpened] = useState<boolean>(false);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);

	return (
		<>
			<FlexDivCentered>
				{isWalletConnected ? (
					<WalletButton variant="solid" onClick={() => setWalletOptionsModalOpened(true)}>
						<StyledConnectionDot />
						{truncatedWalletAddress}
					</WalletButton>
				) : (
					<Button variant="secondary" onClick={connectWallet}>
						{t('common.wallet.connect-wallet')}
					</Button>
				)}
				<Menu>
					<MenuButton
						onClick={() => {
							setSettingsModalOpened(!settingsModalOpened);
						}}
						isActive={settingsModalOpened}
					>
						<Svg src={CogIcon} />
					</MenuButton>
				</Menu>
			</FlexDivCentered>
			{walletOptionsModalOpened && (
				<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</>
	);
};

const Menu = styled.div`
	padding-left: 16px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const WalletButton = styled(Button)`
	display: inline-flex;
	align-items: center;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 12px;
`;

const MenuButton = styled(IconButton)<{ isActive: boolean }>`
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
	padding: 7px;
	border-radius: 4px;
	background: ${(props) => props.theme.colors.navy};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	height: 32px;
`;

export default UserMenu;
