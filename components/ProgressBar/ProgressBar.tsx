import { FC } from 'react';
import styled, { css } from 'styled-components';
import Color from 'color';

import { FlexDivRowCentered } from 'styles/common';

export type ProgressBarType =
  | 'rainbow'
  | 'blue-pink'
  | 'green'
  | 'green-simple'
  | 'blue'
  | 'red'
  | 'red-simple';

type ProgressBarProps = {
  percentage: number;
  className?: string;
  variant: ProgressBarType;
};

const ProgressBar: FC<ProgressBarProps> = ({ percentage, variant, ...rest }) => {
  const unfilledPercentage = 1 - percentage;

  return (
    <ProgressBarWrapper variant={variant} {...rest}>
      {percentage <= 0 && <Bar className="unfilled-bar" percentage={1000} />}
      {percentage > 0 && <Bar className="filled-bar" percentage={Math.min(1, percentage)} />}
      {unfilledPercentage > 0 && <Bar className="unfilled-bar" percentage={unfilledPercentage} />}
    </ProgressBarWrapper>
  );
};

const ProgressBarWrapper = styled(FlexDivRowCentered)<{
  variant?: ProgressBarType;
}>`
  height: 4px;
  > div {
    height: 100%;
  }

  ${(props) =>
    props.variant === 'rainbow' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.rainbowGradient};
      }
      .unfilled-bar {
        background: ${(props) => props.theme.colors.white};
        opacity: 0.2;
      }
    `}

  ${(props) =>
    props.variant === 'blue-pink' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.blue};
        border: 2px solid ${(props) => props.theme.colors.blue};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.blue).alpha(0.6).rgb().string()};
      }

      .unfilled-bar {
        border: 2px solid ${(props) => props.theme.colors.pink};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.pink).alpha(0.6).rgb().string()};
      }
    `}

  ${(props) =>
    props.variant === 'green' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.green};
        border: 2px solid ${(props) => props.theme.colors.green};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.green).alpha(0.6).rgb().string()};
      }

      .unfilled-bar {
        border: 2px solid ${(props) => props.theme.colors.green};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.green).alpha(0.6).rgb().string()};
      }
    `}

  ${(props) =>
    props.variant === 'green-simple' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.green};
      }

      .unfilled-bar {
        background: ${(props) => props.theme.colors.white};
        opacity: 0.2;
      }
    `}

  ${(props) =>
    props.variant === 'blue' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.blue};
        border: 2px solid ${(props) => props.theme.colors.blue};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.blue).alpha(0.6).rgb().string()};
      }

      .unfilled-bar {
        border: 2px solid ${(props) => props.theme.colors.blue};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.blue).alpha(0.6).rgb().string()};
      }
    `}

  ${(props) =>
    props.variant === 'red' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.red};
        border: 2px solid ${(props) => props.theme.colors.red};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.red).alpha(0.6).rgb().string()};
      }

      .unfilled-bar {
        border: 2px solid ${(props) => props.theme.colors.red};
        box-shadow: 0px 0px 15px
          ${(props) => Color(props.theme.colors.red).alpha(0.6).rgb().string()};
      }
    `}

  ${(props) =>
    props.variant === 'red-simple' &&
    css`
      .filled-bar {
        background: ${(props) => props.theme.colors.red};
      }

      .unfilled-bar {
        background: ${(props) => props.theme.colors.white};
        opacity: 0.2;
      }
    `}
`;

const Bar = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage * 100}%;
`;

export default ProgressBar;
