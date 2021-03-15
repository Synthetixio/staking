import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';

import Table from 'components/Table';
import Currency from 'components/Currency';
import { Loan } from 'queries/loans/types';
import { ACTION_BOX_WIDTH } from 'sections/loans/constants';
import { useLoans } from 'sections/loans/contexts/loans';
import { formatUnits } from 'utils/formatters/number';
import ModifyLoanMenu from './ModifyLoanMenu';

const SMALL_COL_WIDTH = 80;
const LARGE_COL_WIDTH = (ACTION_BOX_WIDTH - SMALL_COL_WIDTH * 2) / 2 - 20;

type LoanListProps = {
	actions: string[];
};

const LoanList: React.FC<LoanListProps> = ({ actions }) => {
	const { t } = useTranslation();
	const { isLoadingLoans: isLoading, loans: data } = useLoans();

	const columns = React.useMemo(
		() => [
			{
				Header: <>{t('loans.tabs.list.types.debt')}</>,
				accessor: 'debt',
				sortable: true,
				width: LARGE_COL_WIDTH,
				Cell: (cellProps: CellProps<Loan>) => {
					const loan = cellProps.row.original;
					return (
						<CurrencyIconContainer>
							<Currency.Name currencyKey={loan.debtAsset} showIcon={true} />
							{formatUnits(loan.amount, 18, 2)}
						</CurrencyIconContainer>
					);
				},
			},
			{
				Header: <>{t('loans.tabs.list.types.collateral')}</>,
				accessor: 'collateral',
				sortable: true,
				width: LARGE_COL_WIDTH,
				Cell: (cellProps: CellProps<Loan>) => {
					const loan = cellProps.row.original;
					return (
						<CurrencyIconContainer>
							<Currency.Name currencyKey={loan.collateralAsset} showIcon={true} />
							{formatUnits(loan.collateral, 18, 2)}
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
					return <div>{formatUnits(loan.cratio.toString(), 18 - 2, 0)}%</div>;
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

	const noResultsMessage =
		!isLoading && data.length === 0 ? (
			<NoResultsMessage>{t('loans.no-active-loans')}</NoResultsMessage>
		) : null;

	return (
		<StyledTable
			palette="primary"
			{...{ isLoading, columns, data }}
			noResultsMessage={noResultsMessage}
			showPagination={true}
		/>
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
	display: grid;
	align-items: center;
	grid-column-gap: 10px;
	grid-template-columns: 1fr 1fr;
`;

export default LoanList;
