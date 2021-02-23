import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import { Loan } from 'queries/loans/types';
import { ACTION_BOX_WIDTH } from 'sections/loans/constants';
import { useLoans } from 'sections/loans/hooks/loans';
import { formatUnits } from 'utils/formatters/big-number';
import LoanModifyModal from './LoanModifyModal';

const COL_WIDTH = ACTION_BOX_WIDTH / 4 - 10;

type ActiveBorrowsTabProps = {};

const ActiveBorrowsTab: React.FC<ActiveBorrowsTabProps> = (props) => {
	const { t } = useTranslation();
	const { isLoading, loans } = useLoans();

	const data: Array<any> = loans.map((loan) => ({
		debt: `${formatUnits(loan.amount, 18, 2)} ${loan.debtAsset}`,
		collateral: `${formatUnits(loan.collateral, 18, 2)} ${loan.collateralAsset}`,
		pnl: `0 sUSD`,
	}));

	const columns = React.useMemo(
		() => [
			{
				Header: <>{t('loans.tabs.list.types.debt')}</>,
				accessor: 'debt',
				sortable: true,
				width: COL_WIDTH,
			},
			{
				Header: <>{t('loans.tabs.list.types.collateral')}</>,
				accessor: 'collateral',
				sortable: true,
				width: COL_WIDTH,
			},
			{
				Header: <>{t('loans.tabs.list.types.pnl')}</>,
				accessor: 'pnl',
				sortable: true,
				width: COL_WIDTH,
			},
			{
				Header: <>{t('loans.tabs.list.types.modify')}</>,
				id: 'modify',
				width: COL_WIDTH,
				sortable: false,
				Cell: (cellProps: CellProps<Loan>) => <LoanModifyModal />,
			},
		],
		[]
	);

	const noResultsMessage =
		!isLoading && data.length === 0 ? (
			<NoResultsMessage>You have no active borrows.</NoResultsMessage>
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
`;

const NoResultsMessage = styled.div`
	text-align: center;
	font-size: 12px;
	padding: 20px 0 0;
`;

export default ActiveBorrowsTab;
