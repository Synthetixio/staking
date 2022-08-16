import { FC, useState, MouseEvent } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { linkCSS } from 'styles/common';
import media from 'styles/media';
import CaretRightIcon from 'assets/svg/app/caret-right-small.svg';
import ROUTES from 'constants/routes';
import StakingLogo from 'assets/svg/app/staking-logo.svg';
import StakingL2Logo from 'assets/svg/app/staking-l2-logo.svg';
import Link from 'next/link';

import { delegateWalletState } from 'store/wallet';
import { MENU_LINKS, MENU_LINKS_L2, MENU_LINKS_DELEGATE } from '../../constants';
import { useAddOptimism } from '../../../hooks';
import DesktopSubMenu, { SubMenuLinkItem } from './DesktopSubMenu';
import { DESKTOP_SIDE_NAV_WIDTH } from 'constants/ui';
import Connector from 'containers/Connector';

const DesktopMenu: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isL2 } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const { showAddOptimism, addOptimismNetwork } = useAddOptimism();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuLinks = delegateWallet ? MENU_LINKS_DELEGATE : isL2 ? MENU_LINKS_L2 : MENU_LINKS;

  const onMouseLeave = (e: MouseEvent) => {
    if (
      (openMenu && e.clientX > DESKTOP_SIDE_NAV_WIDTH + 10) || // Move mouse to right
      (openMenu && e.clientY < 20) || // Move mouse up
      (openMenu && e.clientX < 20) // Move mouse to the left
    )
      return setOpenMenu(null);
  };

  return (
    <div onMouseLeave={(e) => onMouseLeave(e)}>
      <StakingLogoWrap>
        <Link href={ROUTES.Home}>
          <div>{isL2 ? <StakingL2Logo width="112" /> : <StakingLogo width="112" />}</div>
        </Link>
      </StakingLogoWrap>
      <MenuLinks>
        {menuLinks.map(({ i18nLabel, link, subMenu }, i) => {
          const onMouseEnter = (link: string) => {
            if (!subMenu) return;
            setOpenMenu(link);
          };
          return (
            <div key={link}>
              <MenuLinkItem
                onClick={() => router.push(link)}
                onMouseEnter={() => onMouseEnter(link)}
                data-testid={`sidenav-${link}`}
                isActive={
                  subMenu
                    ? !!subMenu.find(({ subLink }) => subLink === router.asPath)
                    : router.asPath === link ||
                      (link !== ROUTES.Home && router.asPath.includes(link))
                }
              >
                <div className="link">
                  {t(i18nLabel)}
                  {subMenu && <CaretRightIcon width="5" />}
                </div>
              </MenuLinkItem>
              {subMenu && (
                <DesktopSubMenu i={i} isActive={openMenu === link} key={link}>
                  {subMenu.map(({ i18nLabel, subLink }, j) => {
                    const onClick = () => {
                      router.push(subLink);
                    };
                    return (
                      <SubMenuLinkItem
                        key={`subMenuLinkItem-${j}`}
                        isActive={router.asPath === subLink}
                        data-testid={`sidenav-submenu-${subLink}`}
                        onClick={onClick}
                      >
                        {t(i18nLabel)}
                      </SubMenuLinkItem>
                    );
                  })}
                </DesktopSubMenu>
              )}
            </div>
          );
        })}
        {showAddOptimism && (
          <MenuLinkItem
            onClick={addOptimismNetwork}
            data-testid="sidenav-switch-to-l2"
            isL2Switcher
          >
            <div className="link">{t('sidenav.switch-to-l2')}</div>
          </MenuLinkItem>
        )}
      </MenuLinks>
    </div>
  );
};

const StakingLogoWrap = styled.div`
  padding: 30px 0 44px 24px;
  cursor: pointer;
`;

const MenuLinks = styled.div`
  position: relative;
`;

export const MenuLinkItem = styled.div<{ isActive?: boolean; isL2Switcher?: boolean }>`
  line-height: 40px;
  padding-bottom: 10px;
  position: relative;

  svg {
    margin-left: 6px;
  }

  .link {
    padding-left: 24px;
    display: flex;
    align-items: center;
    ${linkCSS};
    font-family: ${(props) => props.theme.fonts.condensedMedium};
    text-transform: uppercase;
    opacity: ${(props) => (props.isL2Switcher ? 1 : 0.4)};
    font-size: 14px;
    cursor: pointer;
    color: ${(props) => (props.isL2Switcher ? props.theme.colors.pink : props.theme.colors.white)};
    &:hover {
      opacity: ${(props) => (props.isL2Switcher ? 0.8 : 1)};
      color: ${(props) => (props.isL2Switcher ? props.theme.colors.pink : props.theme.colors.blue)};
      svg {
        color: ${(props) => props.theme.colors.blue};
      }
    }
    ${(props) =>
      props.isActive &&
      css`
        opacity: unset;
      `}

    ${media.lessThan('md')`
      font-family: ${(props) => props.theme.fonts.extended};
      font-size: 20px;
      opacity: 1;
    `}
  }

  &:after {
    width: 2px;
    height: 40px;
    content: '';
    position: absolute;
    top: 0;
    /* the line needs to outside (so around -3px), however due to overflow issues, it needs to be inside for now */
    right: 0;
    background: ${(props) => props.theme.colors.blue};
    display: none;
    ${(props) =>
      props.isActive &&
      css`
        display: block;
      `}
  }
`;

export default DesktopMenu;
