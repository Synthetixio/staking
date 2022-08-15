import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import StakingLogo from 'assets/svg/app/staking-logo-small.svg';
import BackIcon from 'assets/svg/app/back.svg';
import CloseIcon from 'assets/svg/app/close.svg';

import ROUTES from 'constants/routes';
import { MOBILE_SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import UIContainer from 'containers/UI';

import MobileMenu from './MobileMenu';
import { SubMenuLink } from '../../constants';
import { useRouter } from 'next/router';
import { MenuLinkItem } from './MobileMenu';

const MobileSideNav: FC = () => {
  const { isMobileNavOpen, isMobileSubNavOpen, activeMobileSubNav, dispatch } =
    UIContainer.useContainer();
  const router = useRouter();

  const { t } = useTranslation();

  return (
    <ClickableWrapper isShowing={isMobileNavOpen} onClick={() => dispatch({ type: 'close' })}>
      <Container
        data-testid="sidenav"
        isShowing={isMobileNavOpen}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <StakingLogoWrap>
          {isMobileSubNavOpen ? (
            <BackIcon width="16" onClick={() => dispatch({ type: 'clear_sub' })} />
          ) : (
            <Link href={ROUTES.Home}>
              <StakingLogo width="39" />
            </Link>
          )}
          <CloseContainer onClick={() => dispatch({ type: 'close' })}>
            <CloseIcon width="14" />
          </CloseContainer>
        </StakingLogoWrap>
        {isMobileSubNavOpen ? (
          <div>
            {activeMobileSubNav?.map(({ i18nLabel, subLink }: SubMenuLink, i) => {
              const onClick = () => {
                router.push(subLink);
                dispatch({ type: 'close' });
              };
              return (
                <MenuLinkItem
                  key={`subMenuLinkItem-${i}`}
                  isActive={router.asPath === subLink}
                  data-testid={`sidenav-submenu-${subLink}`}
                  onClick={onClick}
                >
                  <div className="link">{t(i18nLabel)}</div>
                </MenuLinkItem>
              );
            })}
          </div>
        ) : (
          <MobileMenu dispatch={dispatch} />
        )}
      </Container>
    </ClickableWrapper>
  );
};

const ClickableWrapper = styled.div<{ isShowing: boolean }>`
  z-index: ${zIndex.DIALOG_OVERLAY};
  height: 100%;
  position: fixed;
  top: 0;
  width: 100%;
  left: -${(props: any) => (props.isShowing ? '0px' : '100%')};
  background: transparent;
  border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow-y: hidden;
  overflow-x: visible;
  transition: left 0.3s ease-out;
`;

const Container = styled.div<{ isShowing: boolean }>`
  z-index: ${zIndex.DIALOG_OVERLAY + 1};
  height: 100%;
  position: fixed;
  top: 0;
  width: ${MOBILE_SIDE_NAV_WIDTH}px;
  left: -${(props: any) => (props.isShowing ? 0 : MOBILE_SIDE_NAV_WIDTH)}px;
  background: ${(props) => props.theme.colors.darkGradient1Flipped};
  border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow-y: hidden;
  overflow-x: visible;
  transition: left 0.3s ease-out;
`;

const StakingLogoWrap = styled.div`
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;

const CloseContainer = styled.div`
  padding: 10px;
`;

export default MobileSideNav;
