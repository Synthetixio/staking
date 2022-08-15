import styled from 'styled-components';
import { FC } from 'react';
import { Trans } from 'react-i18next';

import { FlexDivCentered, FlexDivCol, FlexDivRowCentered, NoTextTransform } from 'styles/common';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import CurrencyPrice from 'components/Currency/CurrencyPrice';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import useSynthetixQueries from '@synthetixio/queries';
import { formatPercent } from 'utils/formatters/number';

type PriceItemProps = {
  currencyKey: CurrencyKey;
  currencyRateChange: number | undefined;
};

const PriceItem: FC<PriceItemProps> = ({ currencyKey, currencyRateChange }) => {
  const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
  const { useExchangeRatesQuery } = useSynthetixQueries();
  const exchangeRatesQuery = useExchangeRatesQuery();

  const exchangeRates = exchangeRatesQuery.data ?? null;
  const price = exchangeRates && exchangeRates[currencyKey];
  const trendLinePositive = currencyRateChange !== undefined && currencyRateChange > 0;

  return (
    <Container>
      <Title>
        <span>
          <Trans
            i18nKey="common.currency.currency-price"
            values={{ currencyKey }}
            components={[<NoTextTransform />]}
          />
        </span>
        {currencyRateChange !== undefined ? (
          <FlexDivCentered>
            {trendLinePositive ? <TriangleUp /> : <TriangleDown />}
            <PercentChange trendLinePositive={trendLinePositive}>
              {formatPercent(currencyRateChange)}
            </PercentChange>
          </FlexDivCentered>
        ) : (
          <div>{NO_VALUE}</div>
        )}
      </Title>
      <PriceInfo>
        {price != null ? (
          <StyledCurrencyPrice
            currencyKey={currencyKey}
            price={price}
            sign={selectedPriceCurrency.sign}
            conversionRate={selectPriceCurrencyRate}
          />
        ) : (
          <div>{NO_VALUE}</div>
        )}
      </PriceInfo>
    </Container>
  );
};

const Container = styled(FlexDivCol)`
  width: 100%;
  font-size: 12px;
  margin-bottom: 18px;
  &:last-child {
    padding-bottom: 0;
  }
`;

const Title = styled(FlexDivRowCentered)`
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
  padding-bottom: 5px;
`;

const StyledCurrencyPrice = styled(CurrencyPrice)`
  justify-items: start;
  .price {
    font-family: ${(props) => props.theme.fonts.mono};
  }
`;

const PriceInfo = styled(FlexDivCentered)`
  font-family: ${(props) => props.theme.fonts.mono};
  justify-content: space-between;
`;

const PercentChange = styled.div<{ trendLinePositive: boolean }>`
  font-size: 10px;
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) =>
    props.trendLinePositive ? props.theme.colors.green : props.theme.colors.pink};
`;

const TriangleMixin = `
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
  display: inline-block;
`;

const TriangleUp = styled.div`
  ${TriangleMixin};
  border-bottom: ${(props) => `calc(2 * 4px * 0.866) solid ${props.theme.colors.green}`};
  border-top: 4px solid transparent;
  margin-bottom: 4px;
  margin-right: 4px;
`;

const TriangleDown = styled.div`
  ${TriangleMixin};
  border-top: ${(props) => `calc(2 * 4px * 0.866) solid ${props.theme.colors.pink}`};
  border-bottom: 4px solid transparent;
  margin-bottom: -5px;
  margin-right: 4px;
`;
export default PriceItem;
