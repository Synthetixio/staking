import { ReactNode } from 'react';
import styled, { css, useTheme } from 'styled-components';

import { resetButtonCSS } from 'styles/common';

type TabButtonProps = {
  name: string;
  active: boolean;
  onClick?: () => void;
  children: ReactNode;
  color?: string;
  tabHeight?: number;
  inverseTabColor?: boolean;
  isSingle?: boolean;
  isDisabled?: boolean;
};

export const TabButton = (props: TabButtonProps) => {
  const theme = useTheme();
  return (
    <StyledTabButton
      id={`${props.name}-tab`}
      role="tab"
      aria-selected={props.active}
      aria-controls={`${props.name}-tabpanel`}
      tabIndex={-1}
      isDisabled={props.isDisabled}
      color={props.color || theme.colors.blue}
      {...props}
    />
  );
};

export const TabList = ({ children, ...props }: { children: ReactNode; noOfTabs: number }) => (
  <StyledTabList {...props}>{children}</StyledTabList>
);

export const TabPanel = ({
  name,
  active,
  children,
  height,
  padding,
  ...props
}: {
  name: string;
  active: boolean;
  children: ReactNode;
  height?: number;
  padding: number;
}) =>
  active ? (
    <TabPanelContainer
      id={`${name}-tabpanel`}
      role="tabpanel"
      aria-labelledby={`${name}-tab`}
      tabIndex={-1}
      height={height}
      padding={padding}
      {...props}
    >
      {children}
    </TabPanelContainer>
  ) : null;

export const TabPanelContainer = styled.div<{ height?: number; padding: number }>`
  outline: none;
  background: ${(props) => props.theme.colors.navy};
  box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
  ${(props) => (props.height != null ? `min-height: ${props.height}px` : 'height: unset')};
  padding: ${(props) => props.padding}px;
`;

const StyledTabList = styled.div.attrs({ role: 'tablist' })<{ noOfTabs: number }>`
  grid-template-columns: ${(props) => '1fr '.repeat(props.noOfTabs)};
  display: grid;
`;

export const StyledTabButton = styled.button<TabButtonProps>`
  ${resetButtonCSS};
  font-family: ${(props) => props.theme.fonts.condensedBold};
  padding: 0;
  background: ${(props) =>
    props.active
      ? props.inverseTabColor
        ? props.theme.colors.black
        : props.theme.colors.backgroundBlue
      : props.inverseTabColor
      ? props.theme.colors.backgroundBlue
      : props.theme.colors.black};
  color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.gray)};

  ${(props) =>
    props.active
      ? css`
          border-top: ${`2px solid ${props.color || props.theme.colors.blue}`};
          border-right: ${`1px solid ${props.theme.colors.grayBlue}`};
          border-left: ${`1px solid ${props.theme.colors.backgroundBlue}`};
          border-bottom: ${`1px solid ${props.theme.colors.backgroundBlue}`};
        `
      : css`
          border-top: ${`2px solid ${props.theme.colors.black}`};
          border-bottom: ${`1px solid ${props.theme.colors.grayBlue}`};
        `}

  ${(props) =>
    props.isSingle &&
    css`
      border-left: none;
      border-right: none;
    `}

    ${(props) =>
    props.isDisabled &&
    css`
      pointer-events: none;
      opacity: 0.3;
    `}


  &:hover {
    color: ${(props) => (props.active ? props.theme.colors.white : props.color)};
    background: ${(props) =>
      props.inverseTabColor ? props.theme.colors.black : props.theme.colors.backgroundBlue};
    border-top: 2px solid ${(props) => (props.active ? 'none' : props.color)};
  }

  height: ${(props) => (props.tabHeight ? `${props.tabHeight}px` : '60px')};

  display: flex;
  align-items: center;
  justify-content: center;
`;
