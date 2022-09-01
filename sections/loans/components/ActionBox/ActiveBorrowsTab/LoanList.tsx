import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';

import media from 'styles/media';
import Table from 'components/Table';
import Currency from 'components/Currency';
import { Loan } from 'containers/Loans/types';
import Loans from 'containers/Loans';
import ModifyLoanMenu from './ModifyLoanMenu';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';
import { formatPercent } from 'utils/formatters/number';
import { wei } from '@synthetixio/wei';

const SMALL_COL_WIDTH = 80;

type LoanListProps = {
  actions: string[];
};

const LoanList: FC<LoanListProps> = ({ actions }) => {
  const { t } = useTranslation();
  const { isLoadingLoans: isLoading, loans: data } = Loans.useContainer();

  const desktopColumns = useMemo(
    () => [
      {
        Header: <>{t('loans.tabs.list.types.debt')}</>,
        accessor: 'debt',
        sortable: true,
        Cell: (cellProps: CellProps<Loan>) => {
          const loan = cellProps.row.original;
          return (
            <CurrencyIconContainer>
              <Currency.Name currencyKey={loan.currency} showIcon={true} />
              {wei(loan.amount).toString(2)}
            </CurrencyIconContainer>
          );
        },
      },
      {
        Header: <>{t('loans.tabs.list.types.collateral')}</>,
        accessor: 'collateral',
        sortable: true,
        Cell: (cellProps: CellProps<Loan>) => {
          const loan = cellProps.row.original;
          return (
            <CurrencyIconContainer>
              <Currency.Name currencyKey={'ETH'} showIcon={true} />
              {wei(loan.collateral).toString(2)}
            </CurrencyIconContainer>
          );
        },
      },
      {
        Header: <>{t('loans.tabs.list.types.cratio')}</>,
        accessor: 'cratio',
        sortable: true,
        width: SMALL_COL_WIDTH,
        Cell: (cellProps: CellProps<Loan>) => {
          const loan = cellProps.row.original;
          return <div>{formatPercent(loan.cratio)}</div>;
        },
      },
      {
        Header: <>{t('loans.tabs.list.types.modify')}</>,
        id: 'modify',
        width: SMALL_COL_WIDTH,
        sortable: false,
        Cell: (cellProps: CellProps<Loan>) => (
          <ModifyLoanMenu loan={cellProps.row.original} {...{ actions }} />
        ),
      },
    ],
    [t, actions]
  );

  const mobileColumns = useMemo(
    () => [
      {
        Header: <>{t('loans.tabs.list.types.debt')}</>,
        accessor: 'debt',
        sortable: true,
        Cell: (cellProps: CellProps<Loan>) => {
          const loan = cellProps.row.original;
          return (
            <CurrencyIconContainer>
              {wei(loan.amount).toString(2)} {loan.currency}
            </CurrencyIconContainer>
          );
        },
      },
      {
        Header: <>{t('loans.tabs.list.types.collateral')}</>,
        accessor: 'collateral',
        sortable: true,
        Cell: (cellProps: CellProps<Loan>) => {
          const loan = cellProps.row.original;
          return (
            <CurrencyIconContainer>
              {wei(loan.collateral).toString(2)} {loan.collateralAsset}
            </CurrencyIconContainer>
          );
        },
      },
      {
        Header: <>{t('loans.tabs.list.types.modify')}</>,
        id: 'modify',
        width: 10,
        sortable: false,
        Cell: (cellProps: CellProps<Loan>) => (
          <ModifyLoanMenu loan={cellProps.row.original} {...{ actions }} />
        ),
      },
    ],
    [t, actions]
  );

  const noResultsMessage =
    !isLoading && data.length === 0 ? (
      <NoResultsMessage>{t('loans.no-active-loans')}</NoResultsMessage>
    ) : null;

  return (
    <>
      <DesktopOrTabletView>
        <StyledTable
          palette="primary"
          {...{ isLoading, data }}
          /* @ts-ignore TODO: replace with chakra table */
          columns={desktopColumns}
          noResultsMessage={noResultsMessage}
          showPagination={true}
        />
      </DesktopOrTabletView>
      <MobileOnlyView>
        <StyledTable
          palette="primary"
          {...{ isLoading, data }}
          /* @ts-ignore TODO: replace with chakra table */
          columns={mobileColumns}
          noResultsMessage={noResultsMessage}
          showPagination={true}
        />
      </MobileOnlyView>
    </>
  );
};

//

const StyledTable = styled(Table)`
  .table-row,
  .table-body-row {
    & > :last-child {
      justify-content: flex-end;
    }
  }

  .table-body {
    min-height: 300px;
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  font-size: 12px;
  padding: 20px 0 0;
`;

const CurrencyIconContainer = styled.div`
  ${media.greaterThan('mdUp')`
    display: grid;
    align-items: center;
    grid-column-gap: 10px;
    grid-template-columns: 2fr 1fr;
  `}
`;

export default LoanList;
