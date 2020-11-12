import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { HistoricalStakingTransaction } from 'queries/staking/types';

import { GridDivCenteredRow } from 'styles/common';

interface TransactionsProps {
	transactions: HistoricalStakingTransaction[];
	isLoaded: boolean;
}

const Transactions: FC<TransactionsProps> = ({ transactions, isLoaded }) => {
	const { t } = useTranslation();

	return (
		<>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: 'type',
						accessor: 'type',
						Cell: (
							cellProps: CellProps<
								HistoricalStakingTransaction,
								HistoricalStakingTransaction['type']
							>
						) => <div>{cellProps.value}</div>,
						sortable: true,
						width: 200,
					},
					{
						Header: 'amount',
						accessor: 'value',
						Cell: (
							cellProps: CellProps<
								HistoricalStakingTransaction,
								HistoricalStakingTransaction['value']
							>
						) => <div>{cellProps.value}</div>,
						sortable: true,
						width: 200,
					},
					{
						Header: 'timestamp',
						accessor: 'timestamp',
						Cell: (
							cellProps: CellProps<
								HistoricalStakingTransaction,
								HistoricalStakingTransaction['timestamp']
							>
						) => <div>{cellProps.value}</div>,
						sortable: true,
						width: 200,
					},
					{
						Header: 'tx',
						accessor: 'hash',
						Cell: (
							cellProps: CellProps<
								HistoricalStakingTransaction,
								HistoricalStakingTransaction['hash']
							>
						) => <div>{cellProps.value}</div>,
						sortable: false,
						width: 200,
					},
				]}
				data={transactions}
				isLoading={!isLoaded}
				noResultsMessage={
					isLoaded && transactions.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('synths.synths.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</>
	);
};

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

export default Transactions;
