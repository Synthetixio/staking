import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';

import { FlexDivCentered, IconButton } from 'styles/common';

import Button from 'components/Button';
import { isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';
import SettingsModal from 'sections/shared/modals/SettingsModal';
import ConnectionDot from 'sections/shared/ConnectionDot';

import CogIcon from 'assets/svg/app/cog.svg';
import CaretUp from 'assets/svg/app/caret-up.svg';
import CaretDown from 'assets/svg/app/caret-down.svg';

const UserMenu: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
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
						<Svg src={CogIcon} />
					</MenuButton>
				</Menu>
				<Dropdown>
					{isWalletConnected ? (
						<WalletButton
							variant="solid"
							onClick={() => setWalletOptionsModalOpened(!walletOptionsModalOpened)}
						>
							<FlexDivCentered>
								<StyledConnectionDot />
								{truncatedWalletAddress}
							</FlexDivCentered>

							{walletOptionsModalOpened ? <Svg src={CaretUp} /> : <Svg src={CaretDown} />}
						</WalletButton>
					) : (
						<WalletButton
							variant="solid"
							onClick={() => setWalletOptionsModalOpened(!walletOptionsModalOpened)}
						>
							<FlexDivCentered>
								<StyledConnectionDot />
								{t('common.wallet.not-connected')}
							</FlexDivCentered>
							{walletOptionsModalOpened ? <Svg src={CaretUp} /> : <Svg src={CaretDown} />}
						</WalletButton>
					)}
					{walletOptionsModalOpened && (
						<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
					)}
				</Dropdown>
			</FlexDivCentered>

			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</>
	);
};

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 8px;
`;

const Menu = styled.div`
	padding-right: 16px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const WalletButton = styled(Button)`
	display: inline-flex;
	align-items: center;
	justify-content: space-between;
	text-transform: uppercase;

	svg {
		margin-left: 5px;
		color: ${(props) => props.theme.colors.gray};
	}
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

const Dropdown = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	height: 100%;
	z-index: 100;
	width: 185px;
`;

export default UserMenu;
