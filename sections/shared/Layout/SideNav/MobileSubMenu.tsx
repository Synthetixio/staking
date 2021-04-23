import { FC } from 'react';
import styled from 'styled-components';

import SubMenu from './SubMenu';

const MobileSubMenu: FC = () => {
	return (
		<Container>
			<SubMenu />
		</Container>
	);
};

const Container = styled.div`
	padding-left: 24px;
`;

export default MobileSubMenu;
