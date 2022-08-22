import { FC, ReactNode, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useRecoilValue } from 'recoil';
import i18n from 'i18n';

import media from 'styles/media';

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
    background-color: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white}
  }

  .bn-notify-custom {
    && {
      font-family: ${(props) => props.theme.fonts.regular};
    }
  }


  /** scrollbar **/
  ::-webkit-scrollbar {
    width: 8px;
    height: 3px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    border-radius: 3px;
  }

  scrollbar-face-color: ${(props) => props.theme.colors.pink};
  scrollbar-base-color: ${(props) => props.theme.colors.pink};
  scrollbar-3dlight-color: ${(props) => props.theme.colors.pink};
  scrollbar-highlight-color: ${(props) => props.theme.colors.pink};
  scrollbar-track-color: ${(props) => props.theme.colors.grayBlue};
  scrollbar-arrow-color: ${(props) => props.theme.colors.grayBlue};
  scrollbar-shadow-color: ${(props) => props.theme.colors.pink};
  scrollbar-dark-shadow-color: ${(props) => props.theme.colors.pink};

  ::-webkit-scrollbar-button {
    background-color: ${(props) => props.theme.colors.grayBlue};
  }
  ::-webkit-scrollbar-track {
    background-color: ${(props) => props.theme.colors.pink};
  }
  ::-webkit-scrollbar-track-piece {
    background-color: ${(props) => props.theme.colors.grayBlue};
  }
  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.blue};
  }
  ::-webkit-scrollbar-corner {
    background-color: ${(props) => props.theme.colors.pink};
  }
  ::-webkit-resizer {
    background-color: ${(props) => props.theme.colors.blue};
  }

  /* mobile tables */

  ${media.lessThan('md')`
    .table-header-cell,
    .table-body-cell {
      white-space: nowrap;
    }
  `}
`;

export default Layout;
