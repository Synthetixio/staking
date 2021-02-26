import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import { Loan } from 'queries/loans/types';
import { ACTION_BOX_WIDTH, LOAN_TYPE_ETH } from 'sections/loans/constants';
import { useLoans } from 'sections/loans/contexts/loans';
import { formatUnits } from 'utils/formatters/big-number';
import ModifyLoanMenu from './ModifyLoanMenu';

const COL_WIDTH = ACTION_BOX_WIDTH / 4 - 10;

type LoanRowWrap = {
	debt: string;
	collateral: string;
	pnl: string;
	loan: Loan;
};

type LoanListProps = {
	actions: Array<string>;
};

const LoanList: React.FC<LoanListProps> = ({ actions }) => {
	const { t } = useTranslation();
	const { isLoading, loans } = useLoans();

	const data: Array<LoanRowWrap> = loans.map((loan: Loan) => ({
		debt: `${formatUnits(loan.amount, 18, 2)} ${loan.debtAsset}`,
		collateral: `${formatUnits(loan.collateral, 18, 2)} ${loan.collateralAsset}`,
		pnl: `0 sUSD`,
		loan,
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
				Cell: (cellProps: CellProps<LoanRowWrap>) => (
					<ModifyLoanMenu loan={cellProps.row.original.loan} {...{ actions }} />
				),
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

	.table-body {
		min-height: 300px;
	}
`;

const NoResultsMessage = styled.div`
	text-align: center;
	font-size: 12px;
	padding: 20px 0 0;
`;

export default LoanList;
