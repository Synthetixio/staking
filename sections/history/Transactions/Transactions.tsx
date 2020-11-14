import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/Etherscan';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { HistoricalStakingTransaction } from 'queries/staking/types';

import { ExternalLink, GridDivCenteredRow } from 'styles/common';
import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

interface TransactionsProps {
	transactions: HistoricalStakingTransaction[];
	isLoaded: boolean;
}

const Transactions: FC<TransactionsProps> = ({ transactions, isLoaded }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

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
						id: 'link',
						Cell: (cellProps: CellProps<HistoricalStakingTransaction>) => {
							console.log(etherscanInstance);
							return etherscanInstance != null && cellProps.row.original.hash ? (
								<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.hash)}>
									View
								</StyledExternalLink>
							) : (
								NO_VALUE
							);
						},
						sortable: false,
						width: 200,
					},
				]}
				data={transactions}
				columnsDeps={[selectPriceCurrencyRate, etherscanInstance]}
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

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;

export default Transactions;
