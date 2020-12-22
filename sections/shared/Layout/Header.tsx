import { FC } from 'react';
import styled from 'styled-components';

import { HEADER_HEIGHT } from 'constants/ui';

import media from 'styles/media';

import UserMenu from './UserMenu';

const Header: FC = () => (
	<Container>
		<UserMenu />
	</Container>
);

const Container = styled.div`
	float: right;
	${media.lessThan('md')`
		position: fixed;
		background-color: ${(props) => props.theme.colors.black};
		box-shadow: 0 8px 8px 0 ${(props) => props.theme.colors.black};
	`};
	> div {
		height: ${HEADER_HEIGHT};
		line-height: ${HEADER_HEIGHT};
		padding: 0px 30px;
		margin-top: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
`;

export default Header;
