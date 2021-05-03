import { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Trans } from 'react-i18next';

import { MOBILE_BODY_PADDING } from 'constants/ui';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import SideNavContainer from 'containers/SideNav';
import { FlexDivCentered, FlexDivCol, ExternalLink } from 'styles/common';
import media from 'styles/media';
import {
	DesktopOnlyView,
	MobileOnlyView,
	MobileOrTabletView,
	TabletOnlyView,
} from 'components/Media';
import TitleIcon from 'assets/svg/app/menu-hamburger-white.svg';
import StakingLogoTablet from 'assets/svg/app/staking-logo-tablet.svg';
import StakingLogoMobile from 'assets/svg/app/staking-logo-mobile.svg';
import Banner from 'sections/shared/Layout/Banner';
import UserMenu from './UserMenu';

const Header: FC = () => {
	const { showMobileSideNav } = SideNavContainer.useContainer();

	return (
		<HeaderWrapper>
			<DesktopOnlyView>
				<Banner
					localStorageKey={LOCAL_STORAGE_KEYS.WARNING_URL_BANNER_VISIBLE}
					message={
						<Trans
							i18nKey={'user-menu.banner.warning-url'}
							components={[<StyledExternalLink href="https://staking.synthetix.io" />]}
						/>
					}
				/>
			</DesktopOnlyView>
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
						<Title onClick={showMobileSideNav}>
							<Svg src={TitleIcon} />
							HOME
						</Title>
					</MobileOrTabletView>
					<Sep />
					<UserMenu />
				</FlexDivCentered>
			</Container>
		</HeaderWrapper>
	);
};

const HeaderWrapper = styled.div`
	position: relative;
`;

const Container = styled(FlexDivCol)`
	padding: 24px 30px 0 0;

	${media.lessThan('mdUp')`
		padding: 10px ${MOBILE_BODY_PADDING}px 0;
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

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;

export default Header;
