import { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Stats from '../Stats';

import Header from './Header';
import SideNav from './SideNav';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<GlobalStyle />
			<Page>
				<SideNav />
				<Content>
					<Header />
					<Stats />
					{children}
				</Content>
			</Page>
		</>
	);
};

const Page = styled.div`
	flex: 1;
`;

const Content = styled.div`
	margin-left: 220px; /* Same as the width of the sidebar */
	padding: 0px 20px;
`;

const GlobalStyle = createGlobalStyle`
  body {
		background-color: ${(props) => props.theme.colors.darkBlue};
		color: ${(props) => props.theme.colors.white}
  }
`;

export default Layout;
