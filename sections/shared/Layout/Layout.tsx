import { FC, ReactNode, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useRecoilValue } from 'recoil';
import i18n from 'i18n';

import { languageState } from 'store/app';

type LayoutProps = {
	children: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	const language = useRecoilValue(languageState);

	useEffect(() => {
		i18n.changeLanguage(language);
	}, [language]);

	return (
		<>
			<GlobalStyle />
			{children}
		</>
	);
};

const GlobalStyle = createGlobalStyle`
  body {
		background-color: ${(props) => props.theme.colors.darkBlue};
		color: ${(props) => props.theme.colors.white}
  }
`;

export default Layout;
