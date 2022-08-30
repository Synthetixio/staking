import { FC } from 'react';
import styled from 'styled-components';

import { MOBILE_BODY_PADDING } from 'constants/ui';
import { FlexDivCol, FlexDivCentered } from 'styles/common';
import media from 'styles/media';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import BannerManager from 'components/BannerManager';
import UserMenu from '../UserMenu';
import MobileTabletMenu from './MobileTabletMenu';

const Header: FC = () => {
  return (
    <HeaderWrapper>
      <DesktopOnlyView>
        <BannerManager />
      </DesktopOnlyView>
      <Container>
        <FlexDivCentered>
          <MobileOrTabletView>
            <MobileTabletMenu />
          </MobileOrTabletView>
          <Sep />
          <UserMenu />
        </FlexDivCentered>
      </Container>
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div`
  position: relative;
`;

const Container = styled(FlexDivCol)`
  padding: 24px 30px 0 0;

  ${media.lessThan('mdUp')`
    padding: 10px ${MOBILE_BODY_PADDING}px 0;
  `}
`;

const Sep = styled.div`
  flex: 1;
`;

export default Header;
