import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import { Loan } from 'queries/loans/types';
import { ACTION_BOX_WIDTH } from 'sections/loans/constants';
import { useLoans } from 'sections/loans/contexts/loans';
import { formatUnits } from 'utils/formatters/big-number';
import ModifyLoanMenu from './ModifyLoanMenu';

const COL_WIDTH = ACTION_BOX_WIDTH / 4 - 10;

type LoanRowWrap = {
	debt: string;
	collateral: string;
	cratio: string;
	loan: Loan;
};

type LoanListProps = {
	actions: string[];
};

const LoanList: React.FC<LoanListProps> = ({ actions }) => {
	const { t } = useTranslation();
	const { isLoadingLoans: isLoading, loans } = useLoans();

	const data: Array<LoanRowWrap> = loans.map((loan: Loan) => ({
		debt: `${formatUnits(loan.amount, 18, 2)} ${loan.debtAsset}`,
		collateral: `${formatUnits(loan.collateral, 18, 2)} ${loan.collateralAsset}`,
		cratio: `${formatUnits(loan.cratio.toString(), 18 - 2, 2)}%`,
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
				Header: <>{t('loans.tabs.list.types.cratio')}</>,
				accessor: 'cratio',
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

export default LoanList;
