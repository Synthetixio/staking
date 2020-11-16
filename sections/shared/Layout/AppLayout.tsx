import { SIDE_NAV_WIDTH } from 'constants/ui';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Header from './Header';
import SideNav from './SideNav';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<>
		<SideNav />
		<Header />
		<Content>{children}</Content>
	</>
);

const Content = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding-right: 40px;
	padding-left: calc(${SIDE_NAV_WIDTH} + 40px);
`;

export default AppLayout;
