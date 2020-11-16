import { FC } from 'react';
import styled from 'styled-components';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { HEADER_HEIGHT, zIndex } from 'constants/ui';

import media from 'styles/media';

import UserMenu from './UserMenu';
import MobileUserMenu from './MobileUserMenu';

const Header: FC = () => (
	<Container>
		<MobileHiddenView>
			<UserMenu />
		</MobileHiddenView>
		<MobileOnlyView>
			<MobileUserMenu />
		</MobileOnlyView>
	</Container>
);

const Container = styled.div`
	float: right;
	${media.lessThan('md')`
		position: fixed;
		background-color: ${(props) => props.theme.colors.darkBlue};
		box-shadow: 0 8px 8px 0 ${(props) => props.theme.colors.darkBlue};
	`};
	> div {
		height: ${HEADER_HEIGHT};
		line-height: ${HEADER_HEIGHT};
		padding: 30px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
`;

export default Header;
