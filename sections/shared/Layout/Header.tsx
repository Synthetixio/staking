import { FC } from 'react';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { FlexDivCentered } from 'styles/common';
import { isShowingSideNavState } from 'store/ui';
import media from 'styles/media';
import { MobileOrTabletView } from 'components/Media';
import TitleIcon from 'assets/svg/app/menu-hamburger-white.svg';

import UserMenu from './UserMenu';

const Header: FC = () => {
	const setIsShowingSideNav = useSetRecoilState(isShowingSideNavState);
	const showSideNav = () => setIsShowingSideNav(true);
	return (
		<Container>
			<MobileOrTabletView>
				<Title onClick={showSideNav}>
					<Svg src={TitleIcon} />
					HOME
				</Title>
			</MobileOrTabletView>
			<Sep />
			<UserMenu />
		</Container>
	);
};

const Container = styled(FlexDivCentered)`
	justify-content: flex-end;
	padding: 24px 30px 0 0;

	${media.lessThan('mdUp')`
		padding-left: 30px;
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

export default Header;
