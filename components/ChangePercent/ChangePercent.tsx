import type { FC } from 'react';

import { formatPercent } from 'utils/formatters/number';
import styled from 'styled-components';

import ChangePositiveIcon from 'assets/svg/app/change-positive.svg';
import ChangeNegativeIcon from 'assets/svg/app/change-negative.svg';

type ChangePercentProps = {
  value: number;
  className?: string;
};

export const ChangePercent: FC<ChangePercentProps> = ({ value, ...rest }) => {
  const isPositive = value >= 0;

  return (
    <CurrencyChange isPositive={isPositive} {...rest}>
      {isPositive ? <ChangePositiveIcon width="8" /> : <ChangeNegativeIcon width="8" />}
      {formatPercent(Math.abs(value))}
    </CurrencyChange>
  );
};

const CurrencyChange = styled.span<{ isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.pink)};
  svg {
    margin-right: 2px;
  }
`;

export default ChangePercent;
