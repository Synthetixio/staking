import styled from 'styled-components';
import { FC, useState } from 'react';
import Link from 'next/link';
import { Svg } from 'react-optimized-image';

import StakingLogo from 'assets/svg/app/staking-logo-small.svg';
import BackIcon from 'assets/svg/app/back.svg';
import CloseIcon from 'assets/svg/app/close.svg';

import ROUTES from 'constants/routes';
import { MOBILE_SIDE_NAV_WIDTH, zIndex } from 'constants/ui';

import SideNav from '../Desktop/SideNav';
import MobileSubMenu from './MobileSubMenu';

const MobileSideNav: FC = () => {
	const [isSubMenuOpen, setSubMenuOpen] = useState(false);

	const toggle = () => {
		setSubMenuOpen(!!isSubMenuOpen);
	};

	return (
		<Container data-testid="sidenav" isShowing={isSubMenuOpen}>
			<StakingLogoWrap>
				{isSubMenuOpen ? (
					<Svg src={BackIcon} onClick={toggle} />
				) : (
					<Link href={ROUTES.Home}>
						<Svg src={StakingLogo} />
					</Link>
				)}
				<CloseContainer onClick={toggle}>
					<Svg src={CloseIcon} />
				</CloseContainer>
			</StakingLogoWrap>
			{isSubMenuOpen ? <MobileSubMenu /> : <SideNav />}
		</Container>
	);
};

export default MobileSideNav;

const Container = styled.div<{ isShowing: boolean }>`
	z-index: ${zIndex.DIALOG_OVERLAY};
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
