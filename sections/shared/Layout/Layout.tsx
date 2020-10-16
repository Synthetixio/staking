import { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import Header from './Header';
import SideNav from './SideNav';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<GlobalStyle />
			<SideNav />
			<Header />
			<SectionWrap>
				<section>{children}</section>
			</SectionWrap>
		</>
	);
};

const SectionWrap = styled.div`
	position: absolute;
	top: 60px;
	left: 240px;
`;

const GlobalStyle = createGlobalStyle`
  body {
		background-color: ${(props) => props.theme.colors.darkBlue};
		color: ${(props) => props.theme.colors.white}
  }
`;

export default Layout;
