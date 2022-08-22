import { FC, ReactNode, useEffect } from 'react';
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

  return <>{children}</>;
};

export default Layout;
