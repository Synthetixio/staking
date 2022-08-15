import { DESKTOP_SIDE_NAV_WIDTH } from 'constants/ui';
import useIsMounted from 'hooks/isMounted';
import { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import media from 'styles/media';

type SubMenuProps = {
  children: ReactNode;
  i: number;
  isActive: boolean;
};

const DesktopSubMenu: FC<SubMenuProps> = ({ children, i, isActive }) => {
  const mounted = useIsMounted();

  return mounted
    ? createPortal(
        <SubContainer i={i} isActive={isActive}>
          <Inner>{children}</Inner>
        </SubContainer>,
        document.body
      )
    : null;
};

export const SubContainer = styled(FlexDivColCentered)<{ i: number; isActive: boolean }>`
  padding-top: ${({ i }) => 111 + i * 50}px; // (Logo + container) + index offset * link height;
  background: ${(props) => props.theme.colors.darkGradient1};
  top: 0px;
  bottom: 0px;
  transform: translateX(0px);
  border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
  height: 100%;
  width: 140px;
  background: ${(props) => props.theme.colors.darkGradient1};
  position: fixed;
  transition: all 0.25s ease-in-out;
  transform: translateX(-100%); // Initial
  ${(props) =>
    props.isActive &&
    css`
      ${media.greaterThan('mdUp')`
        transform: translateX(calc(${DESKTOP_SIDE_NAV_WIDTH}px));
      `}
    `}
`;

export const SubMenuLinkItem = styled.div<{ isActive: boolean }>`
  padding-left: 26px;
  line-height: 40px;
  padding-bottom: 10px;
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  text-transform: uppercase;
  opacity: 0.4;
  font-size: 14px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.white};
  &:hover {
    opacity: unset;
    color: ${(props) => props.theme.colors.blue};
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
`;

const Inner = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  position: fixed;
`;

export default DesktopSubMenu;
