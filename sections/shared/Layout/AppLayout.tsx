import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Header from './Header';
import SideNav from './SideNav';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => (
	<Page>
		<SideNav />
		<Content>
			<Header />
			{children}
		</Content>
	</Page>
);

const Page = styled.div`
	flex: 1;
`;

const Content = styled.div`
	margin-left: 220px; /* Same as the width of the sidebar */
	padding: 0px 200px;
`;

export default AppLayout;
