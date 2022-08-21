import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import media from 'styles/media';
import {
  FlexDivColCentered,
  FullScreenContainer,
  resetHeadingMixin,
  FlexDivCol,
} from 'styles/common';

import StakingLogo from 'assets/svg/app/staking-logo.svg';

import SocialLinks from '../components/SocialLinks';
import useSynthetixQueries from '@synthetixio/queries';
import { PROD_HOSTNAME } from 'constants/links';

type SystemStatusProps = {
  children: React.ReactNode;
};

export const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 min

const SystemStatus: FC<SystemStatusProps> = ({ children }) => {
  const { t } = useTranslation();

  const { useIsSystemOnMaintenance } = useSynthetixQueries();

  // current onchain state ( no interval for now, should be added when we are close to a release to save requests )
  const isSystemOnMaintenanceQuery = useIsSystemOnMaintenance({
    refetchInterval: REFRESH_INTERVAL,
  });

  const appOnMaintenance =
    typeof window !== 'undefined' &&
    window.location.hostname === PROD_HOSTNAME &&
    (isSystemOnMaintenanceQuery.isSuccess ? isSystemOnMaintenanceQuery.data : false);

  return appOnMaintenance ? (
    <>
      <Head>
        <title>{t('system-status.page-title')}</title>
      </Head>
      <FullScreenContainer>
        <Content>
          <Header>
            <StakingLogo width="112" />
          </Header>
          <Container>
            <Title>
              {t('system-status.title-line1')}
              <span>{t('system-status.title-line2')}</span>
            </Title>
            <Subtitle>{t('system-status.subtitle')}</Subtitle>
            <SocialLinks />
          </Container>
        </Content>
      </FullScreenContainer>
    </>
  ) : (
    <>{children}</>
  );
};

const Header = styled.header`
  padding-top: 24px;
`;

const Content = styled(FlexDivCol)`
  position: relative;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  flex-grow: 1;
`;

const Container = styled(FlexDivColCentered)`
  flex-grow: 1;
  justify-content: center;
  text-align: center;
  margin-top: -24px;
`;

const Title = styled.h1`
  ${resetHeadingMixin};
  text-align: center;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.black};
  font-family: ${(props) => props.theme.fonts.mono};
  -webkit-text-stroke: 1px ${(props) => props.theme.colors.pink};
  font-size: 72px;
  line-height: 72px;
  padding-bottom: 30px;
  span {
    display: block;
  }
  ${media.lessThan('sm')`
    font-size: 40px;
    line-height: 40px;
  `}
`;

const Subtitle = styled.h2`
  ${resetHeadingMixin};
  font-size: 14px;
  color: ${(props) => props.theme.colors.white};
`;

export default SystemStatus;
