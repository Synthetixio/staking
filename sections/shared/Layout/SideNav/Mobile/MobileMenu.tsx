import { FC, Dispatch } from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { linkCSS } from 'styles/common';
import media from 'styles/media';
import CaretRightIcon from 'assets/svg/app/caret-right-small.svg';
import ROUTES from 'constants/routes';

import { delegateWalletState } from 'store/wallet';
import { MENU_LINKS, MENU_LINKS_L2, MENU_LINKS_DELEGATE, SubMenuLink } from '../../constants';
import Settings from '../../Settings';
import { useAddOptimism } from '../../../hooks';
import { Actions } from 'containers/UI/reducer';
import Connector from 'containers/Connector';

type MobileMenuProps = {
  dispatch: Dispatch<Actions>;
};

const MobileMenu: FC<MobileMenuProps> = ({ dispatch }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isL2 } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const { showAddOptimism, addOptimismNetwork } = useAddOptimism();

  const menuLinks = delegateWallet ? MENU_LINKS_DELEGATE : isL2 ? MENU_LINKS_L2 : MENU_LINKS;

  const navigateTo = (subMenu: SubMenuLink[] | undefined, link: string) => {
    if (subMenu) {
      dispatch({ type: 'set_sub', subMenu });
    } else {
      dispatch({ type: 'close' });
      router.push(link);
    }
  };

  return (
    <MenuLinks>
      {menuLinks.map(({ i18nLabel, link, subMenu }) => (
        <MenuLinkItem
          onClick={() => navigateTo(subMenu, link)}
          key={link}
          data-testid={`sidenav-${link}`}
          isActive={
            subMenu
              ? !!subMenu.find(({ subLink }) => subLink === router.asPath)
              : router.asPath === link || (link !== ROUTES.Home && router.asPath.includes(link))
          }
        >
          <div className="link">
            {t(i18nLabel)}
            {subMenu && <CaretRightIcon width="5" />}
          </div>
        </MenuLinkItem>
      ))}
      {showAddOptimism && (
        <MenuLinkItem onClick={addOptimismNetwork} data-testid="sidenav-switch-to-l2" isL2Switcher>
          <div className="link">{t('sidenav.switch-to-l2')}</div>
        </MenuLinkItem>
      )}
      <Settings />
    </MenuLinks>
  );
};

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

export default MobileMenu;
