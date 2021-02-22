import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import { Loan } from 'queries/loans/types';
import { ACTION_BOX_WIDTH } from 'sections/loans/constants';

type BorrowSynthsTabProps = {};

const BorrowSynthsTab: React.FC<BorrowSynthsTabProps> = (props) => {
	const { t } = useTranslation();
	const isLoaded = true;
	const width = ACTION_BOX_WIDTH / 4 - 10;

	const columns = React.useMemo(
		() => [
			{
				Header: <>{t('loans.tabs.list.types.loan')}</>,
				accessor: 'type',
				Cell: (cellProps: CellProps<Loan, Loan['loan']>) => null,
				sortable: true,
				width,
			},
			{
				Header: <>{t('loans.tabs.list.types.collateral')}</>,
				accessor: 'collateral',
				Cell: (cellProps: CellProps<Loan, Loan['collateral']>) => null,
				sortable: true,
				width,
			},
			{
				Header: <>{t('loans.tabs.list.types.value')}</>,
				accessor: 'value',
				Cell: (cellProps: CellProps<Loan, Loan['value']>) => null,
				sortable: true,
				width,
			},
			{
				Header: <>{t('loans.tabs.list.types.modify')}</>,
				id: 'modify',
				Cell: (cellProps: CellProps<Loan>) => null,
				width,
			},
		],
		[]
	);

	const loans: Array<Loan> = [];

	const noResultsMessage = null;

	return (
		<StyledTable
			palette="primary"
			columns={columns}
			data={loans}
			isLoading={!isLoaded}
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
`;

export default BorrowSynthsTab;
