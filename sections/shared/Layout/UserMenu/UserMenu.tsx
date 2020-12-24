import { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';
import OutsideClickHandler from 'react-outside-click-handler';

import { FlexDivCentered, GridDivCenteredCol, IconButton, UpperCased } from 'styles/common';
import { zIndex } from 'constants/ui';

import Button from 'components/Button';
import { isWalletConnectedState, truncatedWalletAddressState, networkState } from 'store/wallet';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';
import SettingsModal from 'sections/shared/modals/SettingsModal';
import ConnectionDot from 'sections/shared/ConnectionDot';

import CogIcon from 'assets/svg/app/cog.svg';
import CaretUp from 'assets/svg/app/caret-up.svg';
import CaretDown from 'assets/svg/app/caret-down.svg';
import WatchWalletModal from 'sections/shared/modals/WatchWalletModal';

const caretUp = <Svg src={CaretUp} viewBox={`0 0 ${CaretUp.width} ${CaretUp.height}`} />;
const caretDown = <Svg src={CaretDown} viewBox={`0 0 ${CaretDown.width} ${CaretDown.height}`} />;

const UserMenu: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [walletOptionsModalOpened, setWalletOptionsModalOpened] = useState<boolean>(false);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [watchWalletModalOpened, setWatchWalletModalOpened] = useState<boolean>(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const network = useRecoilValue(networkState);

	return (
		<Container>
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
				<DropdownContainer>
					<OutsideClickHandler onOutsideClick={() => setWalletOptionsModalOpened(false)}>
						{isWalletConnected ? (
							<WalletButton
								variant="solid"
								onClick={() => {
									setWalletOptionsModalOpened(!walletOptionsModalOpened);
								}}
								isActive={walletOptionsModalOpened}
								data-testid="user-menu"
							>
								<FlexDivCentered data-testid="wallet-address">
									<StyledConnectionDot />
									{truncatedWalletAddress}
								</FlexDivCentered>
								<NetworkTag className="network-tag" data-testid="network-tag">
									{network?.name}
								</NetworkTag>
								{walletOptionsModalOpened ? caretUp : caretDown}
							</WalletButton>
						) : (
							<WalletButton
								variant="solid"
								onClick={() => setWalletOptionsModalOpened(!walletOptionsModalOpened)}
								data-testid="user-menu"
							>
								<FlexDivCentered>
									<StyledConnectionDot />
									<UpperCased>{t('common.wallet.not-connected')}</UpperCased>
								</FlexDivCentered>
								{walletOptionsModalOpened ? caretUp : caretDown}
							</WalletButton>
						)}
						{walletOptionsModalOpened && (
							<WalletOptionsModal
								onDismiss={() => setWalletOptionsModalOpened(false)}
								setWatchWalletModalOpened={setWatchWalletModalOpened}
							/>
						)}
					</OutsideClickHandler>
				</DropdownContainer>
			</FlexDivCentered>
			{watchWalletModalOpened && (
				<WatchWalletModal onDismiss={() => setWatchWalletModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</Container>
	);
};

const Container = styled(GridDivCenteredCol)`
	grid-gap: 15px;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 8px;
`;

const Menu = styled.div`
	padding-right: 16px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const NetworkTag = styled(FlexDivCentered)`
	background: ${(props) => props.theme.colors.mediumBlue};
	font-size: 10px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	padding: 2px 5px;
	border-radius: 100px;
	height: 18px;
	text-align: center;
	justify-content: center;
	text-transform: uppercase;
`;

const WalletButton = styled(Button)`
	display: inline-flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid ${(props) => props.theme.colors.mediumBlue};

	svg {
		margin-left: 5px;
		width: 10px;
		height: 10px;
		color: ${(props) => props.theme.colors.gray};
		${(props) =>
			props.isActive &&
			css`
				color: ${(props) => props.theme.colors.white};
			`}
	}
	&:hover {
		${NetworkTag} {
			background: ${(props) => props.theme.colors.navy};
		}
	}
`;

const MenuButton = styled(IconButton)<{ isActive: boolean }>`
	border: 1px solid ${(props) => props.theme.colors.mediumBlue};
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
	padding: 7px;
	border-radius: 4px;
	background: ${(props) => props.theme.colors.navy};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	height: 32px;
`;

const DropdownContainer = styled.div`
	width: 185px;
	height: 32px;
	position: relative;

	> div {
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		z-index: ${zIndex.DROPDOWN};
		width: inherit;
	}
`;

export default UserMenu;
