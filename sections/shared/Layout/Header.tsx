import { FC } from 'react';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { FlexDivCentered, FlexDivCol } from 'styles/common';
import { isShowingSideNavState } from 'store/ui';
import media from 'styles/media';
import { MobileOnlyView, MobileOrTabletView, TabletOnlyView } from 'components/Media';
import TitleIcon from 'assets/svg/app/menu-hamburger-white.svg';
import StakingLogoTablet from 'assets/svg/app/staking-logo-tablet.svg';
import StakingLogoMobile from 'assets/svg/app/staking-logo-mobile.svg';

import UserMenu from './UserMenu';

const Header: FC = () => {
	const setIsShowingSideNav = useSetRecoilState(isShowingSideNavState);
	const showSideNav = () => setIsShowingSideNav(true);
	return (
		<Container>
			<LogoContainer>
				<TabletOnlyView>
					<Svg src={StakingLogoTablet} />
				</TabletOnlyView>
				<MobileOnlyView>
					<Svg src={StakingLogoMobile} />
				</MobileOnlyView>
			</LogoContainer>
			<FlexDivCentered>
				<MobileOrTabletView>
					<Title onClick={showSideNav}>
						<Svg src={TitleIcon} />
						HOME
					</Title>
				</MobileOrTabletView>
				<Sep />
				<UserMenu />
			</FlexDivCentered>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	padding: 24px 30px 0 0;

	${media.lessThan('mdUp')`
		padding: 10px 30px 0;
	`}
`;

const Title = styled.div`
	display: flex;
	align-items: center;
	color: white;
	cursor: pointer;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;

	svg {
		margin-right: 10px;
	}
`;

const Sep = styled.div`
	flex: 1;
`;

const LogoContainer = styled.div`
	display: flex;
	justify-content: center;
	padding-bottom: 5px;
`;

export default Header;
