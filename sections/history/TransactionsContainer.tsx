import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ValueType } from 'react-select';
import keyBy from 'lodash/keyBy';

import Connector from 'containers/Connector';

import DateSelect from 'components/DateSelect';
import Select from 'components/Select';
import Button from 'components/Button';

import { formatShortDate } from 'utils/formatters/date';

import {
  CapitalizedText,
  GridDiv,
  TableNoResults,
  TableNoResultsButtonContainer,
} from 'styles/common';

import Transactions from './Transactions';
import {
  TypeFilterOptionType,
  TransactionsContainerProps,
  AmountFilterOptionType,
  AmountFilterType,
} from './types';

import CustomTypeOption from './CustomTypeOption';
import { StakingTransactionType } from '@synthetixio/queries';
import ConnectOrSwitchNetwork from '../../components/ConnectOrSwitchNetwork';

const TransactionsContainer: FC<TransactionsContainerProps> = ({ history, isLoaded }) => {
  const { t } = useTranslation();
  const { isWalletConnected } = Connector.useContainer();

  const [typeFilter, setTypeFilter] = useState<ValueType<TypeFilterOptionType>>();
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [amountFilter, setAmountFilter] = useState<ValueType<AmountFilterOptionType>>();

  const typeFilterList = useMemo(
    () => [
      { label: t('history.table.staking-tx-type.issued'), value: StakingTransactionType.Issued },
      { label: t('history.table.staking-tx-type.burned'), value: StakingTransactionType.Burned },
      {
        label: t('history.table.staking-tx-type.feesClaimed'),
        value: StakingTransactionType.FeesClaimed,
      },
    ],
    [t]
  );

  const amountFilterList = useMemo(
    () => [
      { label: t('history.table.filters.amount.no-selection'), value: null },
      {
        label: t('history.table.filters.amount.less-than-num', {
          num: '1,000',
        }),
        value: AmountFilterType.LESS_THAN_1K,
      },
      {
        label: t('history.table.filters.amount.between-num1-and-num2', {
          num1: '1,000',
          num2: '10,000',
        }),
        value: AmountFilterType.BETWEEN_1K_AND_10K,
      },
      {
        label: t('history.table.filters.amount.between-num1-and-num2', {
          num1: '10,000',
          num2: '100,000',
        }),
        value: AmountFilterType.BETWEEN_10K_AND_100K,
      },
      {
        label: t('history.table.filters.amount.greater-than-num', {
          num: '100,000',
        }),
        value: AmountFilterType.GREATER_THAN_100K,
      },
    ],
    [t]
  );

  const filteredTransactions = useMemo(() => {
    return (
      history?.filter((transaction) => {
        if (typeFilter != null && (typeFilter as any).length) {
          const filters = Object.keys(keyBy(typeFilter, 'value')) as StakingTransactionType[];

          if (!filters.includes(transaction.type)) {
            return false;
          }
        }

        if (amountFilter != null) {
          switch ((amountFilter as AmountFilterOptionType).value) {
            case AmountFilterType.LESS_THAN_1K:
              return transaction.value.lt(1000);
            case AmountFilterType.BETWEEN_1K_AND_10K:
              return transaction.value.gte(1000) && transaction.value.lt(10000);
            case AmountFilterType.BETWEEN_10K_AND_100K:
              return transaction.value.gte(10000) && transaction.value.lt(100000);
            case AmountFilterType.GREATER_THAN_100K:
              return transaction.value.gte(100000);
          }
        }

        if (
          (dateFilter?.startDate != null &&
            transaction.timestamp.toNumber() * 1000 < dateFilter.startDate.getTime()) ||
          (dateFilter?.endDate != null &&
            transaction.timestamp.toNumber() * 1000 >= dateFilter.endDate.getTime())
        ) {
          return false;
        }

        return true;
      }) ?? []
    );
  }, [history, typeFilter, dateFilter, amountFilter]);

  const dateFilterSelectedDates = useMemo(
    () => dateFilter.startDate != null && dateFilter.endDate != null,
    [dateFilter.startDate, dateFilter.endDate]
  );

  const dateFilterRange = useMemo(() => {
    if (dateFilter.startDate != null && dateFilter.endDate != null) {
      return `${formatShortDate(dateFilter.startDate)} – ${formatShortDate(dateFilter.endDate)}`;
    }
    return t('history.table.filters.date.no-selection');
  }, [dateFilter.startDate, dateFilter.endDate, t]);

  const filtersEnabled = useMemo(
    () =>
      dateFilterSelectedDates ||
      amountFilter != null ||
      (typeFilter != null && (typeFilter as any).length),
    [dateFilterSelectedDates, amountFilter, typeFilter]
  );

  const resetFilters = () => {
    setAmountFilter(null);
    setTypeFilter(null);
    setDateFilter({
      startDate: null,
      endDate: null,
    });
  };

  return (
    <>
      <Filters>
        <Select
          inputId="type-filter-list"
          formatOptionLabel={(option: TypeFilterOptionType) => (
            <CapitalizedText>{option.label}</CapitalizedText>
          )}
          options={typeFilterList}
          value={typeFilter}
          onChange={(option: ValueType<TypeFilterOptionType>) => {
            setTypeFilter(option);
          }}
          isMulti={true}
          isSearchable={false}
          isClearable={false}
          placeholder={t('history.table.filters.type.no-selection')}
          components={{
            Option: CustomTypeOption,
          }}
        />
        <Select
          inputId="order-amount-list"
          formatOptionLabel={(option: AmountFilterOptionType) => (
            <CapitalizedText>{option.label}</CapitalizedText>
          )}
          options={amountFilterList}
          value={amountFilter}
          onChange={(option: ValueType<AmountFilterOptionType>) => {
            if (option) {
              setAmountFilter(option);
            }
          }}
          isSearchable={false}
          placeholder={t('history.table.filters.amount.no-selection')}
        />
        <DateSelect
          id="tx-date-filter"
          startDate={dateFilter.startDate}
          endDate={dateFilter.endDate}
          selected={dateFilter.startDate}
          onChange={(dates) => {
            // @ts-ignore
            const [startDate, endDate] = dates;

            setDateFilter({
              startDate,
              endDate,
            });
          }}
          value={dateFilterRange}
          selectsRange={true}
          onClear={() => {
            setDateFilter({
              startDate: new Date(),
              endDate: null,
            });
          }}
          showClear={dateFilterSelectedDates}
        />
      </Filters>
      <Transactions
        transactions={filteredTransactions}
        isLoaded={isWalletConnected ? isLoaded : true}
        noResultsMessage={
          !isWalletConnected ? (
            <TableNoResults>
              <ConnectOrSwitchNetwork />
            </TableNoResults>
          ) : isLoaded && filtersEnabled && filteredTransactions.length === 0 ? (
            <TableNoResults>
              <div>{t('history.table.no-results')}</div>
              <TableNoResultsButtonContainer>
                <ResetFiltersButton variant="primary" onClick={resetFilters}>
                  {t('history.table.view-all-transactions')}
                </ResetFiltersButton>
              </TableNoResultsButtonContainer>
            </TableNoResults>
          ) : isLoaded && filteredTransactions.length === 0 ? (
            <TableNoResults>{t('history.table.no-transactions')}</TableNoResults>
          ) : undefined
        }
      />
    </>
  );
};

const Filters = styled(GridDiv)`
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 18px;
`;

const ResetFiltersButton = styled(Button)`
  margin-top: 20px;
`;

export default TransactionsContainer;
