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
import CaretDownIcon from 'assets/svg/app/caret-down.svg';

type UserMenuProps = {
	isTextButton?: boolean;
};

const UserMenu: FC<UserMenuProps> = ({ isTextButton }) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();
	const [walletOptionsModalOpened, setWalletOptionsModalOpened] = useState<boolean>(false);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	return (
		<>
			<Container>
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
						<WalletButton
							size="sm"
							variant="outline"
							onClick={() => setWalletOptionsModalOpened(true)}
						>
							<StyledConnectionDot />
							{truncatedWalletAddress}
							<Svg src={CaretDownIcon} />
						</WalletButton>
					) : (
						<Button variant={isTextButton ? 'text' : 'primary'} onClick={connectWallet}>
							{t('common.wallet.connect-wallet')}
						</Button>
					)}
				</FlexDivCentered>
			</Container>
			{walletOptionsModalOpened && (
				<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</>
	);
};

const Container = styled.div``;

const Menu = styled.div`
	padding-right: 26px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const WalletButton = styled(Button)`
	display: inline-flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.mono};
	background-color: ${(props) => props.theme.colors.mediumBlue};
	border: 1px solid ${(props) => props.theme.colors.darkBlue};
	color: ${(props) => props.theme.colors.white};
	border-radius: 4px;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	padding: 5px;
`;

// @ts-ignore
// const StyledCaretDownIcon = styled(CaretDownIcon)`
// 	width: 8px;
// 	color: ${(props) => props.theme.colors.white};
// 	margin-left: 7px;
// `;

export default UserMenu;
