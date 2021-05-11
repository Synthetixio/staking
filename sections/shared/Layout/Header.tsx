import { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Trans, useTranslation } from 'react-i18next';
import { NextRouter, useRouter } from 'next/router';

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
	const { t } = useTranslation();
	const { showMobileSideNav } = SideNavContainer.useContainer();
	const router = useRouter();
	const path = getRouterPath(router);

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
				<FlexDivCentered>
					<MobileOrTabletView>
						<Title onClick={showMobileSideNav}>
							<Svg src={TitleIcon} />
							{t(`header.${path}`)}
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
	color: ${(props) => props.theme.colors.blue};
	cursor: pointer;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	text-transform: uppercase;

	svg {
		margin-right: 10px;
	}
`;

const Sep = styled.div`
	flex: 1;
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;

function getRouterPath(router: NextRouter): string {
	const match = router.asPath.match(/\/(\w+)\/?/);
	const path = !match ? 'home' : match[1];
	return path;
}

export default Header;
