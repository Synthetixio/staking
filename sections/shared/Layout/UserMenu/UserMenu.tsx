import { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';
import OutsideClickHandler from 'react-outside-click-handler';
import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';

import {
	FlexDiv,
	FlexDivCentered,
	GridDivCenteredCol,
	IconButton,
	UpperCased,
} from 'styles/common';
import { zIndex } from 'constants/ui';

import Button from 'components/Button';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { isWalletConnectedState, truncatedWalletAddressState, networkState } from 'store/wallet';

import {
	DesktopWalletOptionsModal,
	MobileWalletOptionsModal,
	StyledGlowingButton,
} from 'sections/shared/modals/WalletOptionsModal';
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
	const [networkError, setNetworkError] = useState<string | null>(null);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [watchWalletModalOpened, setWatchWalletModalOpened] = useState<boolean>(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const network = useRecoilValue(networkState);
	const isL2 = network?.useOvm ?? false;

	const addOptimismNetwork = async () => {
		try {
			setNetworkError(null);
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				setNetworkError(t('user-menu.error.please-install-metamask'));
			} else await addOptimismNetworkToMetamask({ ethereum: window.ethereum });
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	const getNetworkName = () => {
		if (network?.useOvm) {
			return `0Ξ ${network?.name}`;
		} else return network?.name;
	};

	return (
		<Container>
			<FlexDivCentered>
				<DesktopOnlyView>
					<FlexDiv>
						{!isL2 && isWalletConnected ? (
							<OptimismButton variant="solid" onClick={addOptimismNetwork}>
								{t('user-menu.layer-2.switch-to-l2')}
							</OptimismButton>
						) : null}

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
											{getNetworkName()}
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
									<DesktopWalletOptionsModal
										onDismiss={() => setWalletOptionsModalOpened(false)}
										setWatchWalletModalOpened={setWatchWalletModalOpened}
									/>
								)}
							</OutsideClickHandler>
						</DropdownContainer>
					</FlexDiv>
				</DesktopOnlyView>
				<MobileOrTabletView>
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
								{getNetworkName()}
							</NetworkTag>
							{walletOptionsModalOpened ? caretUp : caretDown}
						</WalletButton>
					) : (
						<MobileStyledGlowingButton
							data-testid="connect-wallet"
							onClick={() => setWalletOptionsModalOpened(true)}
						>
							{t('common.wallet.connect-wallet')}
						</MobileStyledGlowingButton>
					)}
					{walletOptionsModalOpened && (
						<MobileWalletOptionsModal
							onDismiss={() => setWalletOptionsModalOpened(false)}
							setWatchWalletModalOpened={setWatchWalletModalOpened}
						/>
					)}
				</MobileOrTabletView>
				<Menu>
					<MenuButton
						onClick={() => {
							setSettingsModalOpened(!settingsModalOpened);
						}}
					>
						<Svg src={CogIcon} />
					</MenuButton>
				</Menu>
			</FlexDivCentered>
			{watchWalletModalOpened && (
				<WatchWalletModal onDismiss={() => setWatchWalletModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			<Error>{networkError}</Error>
		</Container>
	);
};

const Container = styled(GridDivCenteredCol)`
	grid-gap: 15px;
	position: relative;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 8px;
`;

const Menu = styled.div`
	padding-left: 16px;
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

const MenuButton = styled(IconButton)`
	border: 1px solid ${(props) => props.theme.colors.mediumBlue};
	color: ${(props) => props.theme.colors.white};
	padding: 7px;
	border-radius: 4px;
	background: ${(props) => props.theme.colors.navy};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	height: 32px;
`;

const OptimismButton = styled(Button)`
	border: 1px solid ${(props) => props.theme.colors.pink};
	background: ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.pink};
	text-transform: uppercase;
	margin-right: 16px;
	&:hover {
		background: ${(props) => props.theme.colors.pink} !important;
		color: ${(props) => props.theme.colors.navy} !important;
	}
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

const Error = styled.div`
	position: absolute;
	top: calc(100% + 10px);
	right: 0;
	font-size: 12px;
	color: ${(props) => props.theme.colors.pink};
`;

const MobileStyledGlowingButton = styled(StyledGlowingButton)`
	max-height: 32px;
	line-height: 32px;
`;

export default UserMenu;
