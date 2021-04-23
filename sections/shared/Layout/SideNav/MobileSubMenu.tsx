import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import { MOBILE_SIDE_NAV_WIDTH } from 'constants/ui';

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
