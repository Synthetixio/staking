import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';

import Connector from 'containers/Connector';

import Button from 'components/Button';
import { isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';
import { FlexDivCentered, resetButtonCSS, ConnectionDot } from 'styles/common';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';
import SettingsModal from 'sections/shared/modals/SettingsModal';

import MenuIcon from 'assets/svg/app/menu.svg';

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
				<Menu>
					<MenuButton
						onClick={() => {
							setSettingsModalOpened(!settingsModalOpened);
						}}
						isActive={settingsModalOpened}
					>
						<Svg src={MenuIcon} />
					</MenuButton>
				</Menu>
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
			</FlexDivCentered>
			{walletOptionsModalOpened && (
				<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</>
	);
};

const Menu = styled.div`
	padding-right: 26px;
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
	box-shadow: 0px 0px 15px rgba(68, 239, 193, 0.6);
`;

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	padding: 5px;
`;

export default UserMenu;
