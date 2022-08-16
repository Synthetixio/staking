import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import SNXStatBackground from 'assets/svg/app/snx-stat-background.svg';
import media from 'styles/media';
import { FlexDivRowCentered, FlexDivColCentered, Tooltip } from 'styles/common';
import InfoIcon from 'assets/svg/app/info.svg';

export type Size = 'md' | 'lg';

type StatBoxProps = {
  title: ReactNode;
  value: ReactNode;
  size?: Size;
  children?: ReactNode;
  tooltipContent?: string;
  onClick?: () => void;
};

const StatBox: FC<StatBoxProps> = ({
  title,
  value,
  tooltipContent,
  size = 'md',
  children,
  ...rest
}) => {
  return (
    <Box {...rest} size={size}>
      <FlexDivRowCentered>
        <Title className="title">{title}</Title>
        {tooltipContent && (
          <StyledTooltip
            arrow={true}
            placement="bottom"
            content={tooltipContent}
            hideOnClick={false}
          >
            <IconContainer>
              <InfoIcon width="12" />
            </IconContainer>
          </StyledTooltip>
        )}
      </FlexDivRowCentered>
      <Value className="value">{value}</Value>
      {children}
    </Box>
  );
};

const IconContainer = styled.div`
  margin-left: 4px;
  margin-bottom: 4px;
`;

const Box = styled(FlexDivColCentered)<{ size: Size }>`
  background-position: center;
  background-repeat: no-repeat;
  justify-content: center;
  ${media.greaterThan('sm')`
    margin: 0px 20px;
  `}
  background-image: url(${SNXStatBackground.src});
  ${(props) =>
    props.size === 'lg' &&
    css`
      background-size: 176px 114px;
      .value {
        font-size: 32px;
      }
    `}

  &:first-child,
  &:last-child {
    ${media.lessThan('mdUp')`
      background-image: none;
      margin: unset;
      position: relative;
      top: -30px;

      .title,
      .value {
        font-size: 12px;
      }
    `}
  }

  &:first-child {
    ${media.lessThan('mdUp')`
      align-items: flex-start;
      grid-area: 2 / 1 / 3 / 2;
    `}
  }

  &:nth-child(2) {
    height: 200px;
    ${media.greaterThan('mdUp')`
      width: 400px;
    `}
    ${media.lessThan('mdUp')`
      grid-area: 1 / 1 / 2 / 3;
    `}
  }

  &:last-child {
    ${media.lessThan('mdUp')`
      align-items: flex-end;
      text-align: right;
      grid-area: 2 / 2 / 3 / 3;
    `}
  }
`;

const Title = styled.span`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  padding-bottom: 5px;
  text-transform: uppercase;
`;

const Value = styled.span`
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 24px;
`;

const StyledTooltip = styled(Tooltip)`
  background: ${(props) => props.theme.colors.mediumBlue};
  .tippy-content {
    font-size: 12px;
    padding: 10px;
  }
`;

export default StatBox;
