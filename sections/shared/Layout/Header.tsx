import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

import UserMenu from './UserMenu';

const Header: FC = () => (
	<Container>
		<UserMenu />
	</Container>
);

const Container = styled(FlexDivCentered)`
	justify-content: flex-end;
	padding: 24px 30px 0 0;
`;

export default Header;
