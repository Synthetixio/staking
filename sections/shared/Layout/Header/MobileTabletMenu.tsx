import { FC, useMemo } from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import UIContainer from 'containers/UI';
import TitleIcon from 'assets/svg/app/menu-hamburger-white.svg';
import { headerInfo } from '../../helpers';

const MobileTabletMenu: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const { headerTitle, headerSubtitle } = useMemo(() => headerInfo(router.asPath), [router.asPath]);

  const { dispatch } = UIContainer.useContainer();

  return (
    <>
      <Title onClick={() => dispatch({ type: 'open' })}>
        <TitleIcon width="18" />
        {headerTitle && (
          <TitleText hasSubTitle={!!headerSubtitle}>{t(`header.${headerTitle}`)}</TitleText>
        )}
        {headerSubtitle && (
          <>
            <TitleSep>|</TitleSep>
            <SubtitleText>{t(`header.${headerTitle}/${headerSubtitle}`)}</SubtitleText>
          </>
        )}
      </Title>
    </>
  );
};

const Title = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  font-size: 12px;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.gray};

  svg {
    margin-right: 10px;
  }
`;

const TitleText = styled.div<{ hasSubTitle: boolean }>`
  color: ${(props) => (props.hasSubTitle ? props.theme.colors.gray : props.theme.colors.blue)};
`;

const TitleSep = styled.div`
  padding: 0 5px;
`;

const SubtitleText = styled.div`
  color: ${(props) => props.theme.colors.blue};
`;

export default MobileTabletMenu;
