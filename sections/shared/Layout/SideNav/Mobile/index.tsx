import { FC, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Svg } from 'react-optimized-image';

import StakingLogo from 'assets/svg/app/staking-logo-small.svg';
import BackIcon from 'assets/svg/app/back.svg';
import CloseIcon from 'assets/svg/app/close.svg';

import ROUTES from 'constants/routes';
import { MOBILE_SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import UIContainer from 'containers/UI';

import MobileMenu from './MobileMenu';
import MobileSubMenu from './MobileSubMenu';

const MobileSideNav: FC = () => {
	const [isSubMenuOpen, setSubMenuOpen] = useState(false);
	const [activeSubMenu, setActiveSubMenu] = useState(null);

	const { isMobileNavOpen, setMobileNavOpen } = UIContainer.useContainer();

	const close = () => {
		setSubMenuOpen(false);
		setMobileNavOpen(false);
	};

	return (
		<ClickableWrapper isShowing={isMobileNavOpen} onClick={close}>
			<Container
				data-testid="sidenav"
				isShowing={isMobileNavOpen}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				<StakingLogoWrap>
					{isSubMenuOpen ? (
						<Svg src={BackIcon} onClick={() => setSubMenuOpen(false)} />
					) : (
						<Link href={ROUTES.Home}>
							<Svg src={StakingLogo} />
						</Link>
					)}
					<CloseContainer onClick={close}>
						<Svg src={CloseIcon} />
					</CloseContainer>
				</StakingLogoWrap>
				{isSubMenuOpen ? (
					<MobileSubMenu setActiveSubMenu={setActiveSubMenu} activeSubMenu={activeSubMenu} />
				) : (
					<MobileMenu setSubMenuOpen={setSubMenuOpen} setActiveSubMenu={setActiveSubMenu} />
				)}
			</Container>
		</ClickableWrapper>
	);
};

const ClickableWrapper = styled.div<{ isShowing: boolean }>`
	z-index: ${zIndex.DIALOG_OVERLAY};
	height: 100%;
	position: fixed;
	top: 0;
	width: 100%;
	left: -${(props: any) => (props.isShowing ? '0px' : '100%')};
	background: transparent;
	border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	display: grid;
	grid-template-rows: auto 1fr auto auto;
	overflow-y: hidden;
	overflow-x: visible;
	transition: left 0.3s ease-out;
`;

const Container = styled.div<{ isShowing: boolean }>`
	z-index: ${zIndex.DIALOG_OVERLAY + 1};
	height: 100%;
	position: fixed;
	top: 0;
	width: ${MOBILE_SIDE_NAV_WIDTH}px;
	left: -${(props: any) => (props.isShowing ? 0 : MOBILE_SIDE_NAV_WIDTH)}px;
	background: ${(props) => props.theme.colors.darkGradient1Flipped};
	border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	display: grid;
	grid-template-rows: auto 1fr auto auto;
	overflow-y: hidden;
	overflow-x: visible;
	transition: left 0.3s ease-out;
`;

const StakingLogoWrap = styled.div`
	height: 75px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
`;

const CloseContainer = styled.div`
	padding: 10px;
`;

export default MobileSideNav;
