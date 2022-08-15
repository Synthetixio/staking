import { FC } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import { Trans } from 'react-i18next';
import { FlexDivCol, NoTextTransform } from 'styles/common';
import { formatFiatCurrency } from 'utils/formatters/number';

type BalanceItemProps = {
  amount: Wei;
  currencyKey: string;
};

const BalanceItem: FC<BalanceItemProps> = ({ amount, currencyKey }) => {
  return (
    <Container>
      <Title>
        <Trans
          i18nKey="common.currency.currency-balance"
          values={{ currencyKey }}
          components={[<NoTextTransform />]}
        />
      </Title>
      <Balance>{formatFiatCurrency(amount)}</Balance>
    </Container>
  );
};

const Container = styled(FlexDivCol)`
  margin-bottom: 18px;
`;

const Title = styled.h3`
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
  padding-bottom: 5px;
  font-size: 12px;
  margin: 0;
`;

const Balance = styled.span`
  font-family: ${(props) => props.theme.fonts.mono};
  color: ${(props) => props.theme.colors.white};
  font-size: 12px;
`;

export default BalanceItem;
