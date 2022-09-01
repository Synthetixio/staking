import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { TableNoResults, TableNoResultsTitle, FlexDiv, Tooltip } from 'styles/common';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';

import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import { SynthTotalSupply } from '@synthetixio/queries';
import { CryptoBalance } from 'hooks/useCryptoBalances';
import Connector from 'containers/Connector';

type DebtPoolTableProps = {
  synths: any;
  isLoading: boolean;
  isLoaded: boolean;
};

const DebtPoolTable: FC<DebtPoolTableProps> = ({ synths, isLoading, isLoaded }) => {
  const { t } = useTranslation();
  const { selectedPriceCurrency } = useSelectedPriceCurrency();
  const { isAppReady } = Connector.useContainer();

  const assetColumns = useMemo(() => {
    if (!isAppReady) {
      return [];
    }

    const columns = [
      {
        Header: <>{t('synths.assets.synths.table.asset')}</>,
        accessor: 'name',
        Cell: (cellProps: any) => {
          return (
            <Legend>
              <LegendIcon
                strokeColor={cellProps.row.original.strokeColor}
                fillColor={cellProps.row.original.fillColor}
              />
              <Currency.Name currencyKey={cellProps.value} showIcon={false} />
            </Legend>
          );
        },

        sortable: false,
        width: 100,
      },
      {
        Header: <>{t('synths.assets.synths.table.skewValue')}</>,
        accessor: 'skewValue',
        Cell: (cellProps: CellProps<SynthTotalSupply>) => (
          <Amount>
            {formatFiatCurrency(cellProps.value, {
              sign: selectedPriceCurrency.sign,
              maxDecimals: 0,
            })}
          </Amount>
        ),
        width: 100,
        sortable: false,
      },
      {
        Header: <>{t('synths.assets.synths.table.percentage-of-pool')}</>,
        accessor: 'poolProportion',
        Cell: (cellProps: CellProps<CryptoBalance>) => (
          <Amount>{formatPercent(cellProps.value)}</Amount>
        ),
        width: 100,
        sortable: false,
      },
      {
        Header: (
          <Tooltip
            arrow={false}
            content={t('synths.assets.synths.table.percentage-to-hedge-tooltip')}
          >
            <p>{t('synths.assets.synths.table.percentage-to-hedge')}</p>
          </Tooltip>
        ),
        accessor: 'userDebtHedgeWithCorrelationInUsd',
        Cell: (cellProps: { value: number }) => {
          const value = cellProps.value;
          const absValue = Math.abs(value);
          const getPrefix = () => {
            if (value === 0) return '';
            if (value > 0) return '+';
            return '-';
          };
          return (
            <Tooltip content={t('synths.assets.synths.table.percentage-to-hedge-value-tooltip')}>
              <Amount>
                {formatFiatCurrency(absValue, {
                  sign: `${getPrefix()}${selectedPriceCurrency.sign}`,
                  maxDecimals: 0,
                })}
              </Amount>
            </Tooltip>
          );
        },
        width: 100,
        sortable: false,
      },
    ];

    return columns;
  }, [selectedPriceCurrency.sign, t, isAppReady]);

  return (
    <StyledTable
      palette="primary"
      /* @ts-ignore TODO: replace with chakra table */
      columns={assetColumns}
      data={synths && synths.length > 0 ? synths : []}
      isLoading={isLoading}
      noResultsMessage={
        isLoaded && synths && synths?.length === 0 ? (
          <TableNoResults>
            <TableNoResultsTitle>{t('common.table.no-data')}</TableNoResultsTitle>
          </TableNoResults>
        ) : undefined
      }
      showPagination={true}
    />
  );
};

const Amount = styled.span<{ danger?: boolean }>`
  color: ${(props) => (props.danger ? props.theme.colors.red : props.theme.colors.white)};
  font-family: ${(props) => props.theme.fonts.mono};
  cursor: ${(props) => (props.danger ? 'pointer' : 'auto')};
`;

const Legend = styled(FlexDiv)`
  align-items: baseline;
`;

const LegendIcon = styled.span<{ strokeColor: string; fillColor: string }>`
  height: 8px;
  width: 8px;
  border: 2px solid ${(props) => props.strokeColor};
  background-color: ${(props) => props.fillColor};
  margin-right: 6px;
`;

const StyledTable = styled(Table)`
  padding: 0 10px;
  .table-body-cell {
    height: 40px;
  }
  .table-body-cell,
  .table-header-cell {
    &:last-child {
      justify-content: flex-end;
    }
  }
`;

export default DebtPoolTable;
