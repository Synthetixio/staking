// import React, { FC } from 'react';
// import { useTranslation } from 'react-i18next';
// import { CellProps } from 'react-table';
// import styled from 'styled-components';
// import { Svg } from 'react-optimized-image';

// import Etherscan from 'containers/Etherscan';

// import Table from 'components/Table';

// import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

// import { formatShortDate } from 'utils/formatters/date';
// import { formatCurrency } from 'utils/formatters/number';

// import { HistoricalStakingTransaction } from 'queries/staking/types';

// import { ExternalLink, GridDivCenteredRow } from 'styles/common';
// import { NO_VALUE } from 'constants/placeholder';
// import { SYNTHS_MAP } from 'constants/currency';

// interface EscrowTableProps {
// 	EscrowTable: HistoricalStakingTransaction[];
// 	isLoaded: boolean;
// }

// const EscrowTable: FC<EscrowTableProps> = ({ EscrowTable, isLoaded }) => {
// 	const { t } = useTranslation();
// 	const { etherscanInstance } = Etherscan.useContainer();

// 	return (
// 		<>
// 			<StyledTable
// 				palette="primary"
// 				columns={[
// 					{
// 						Header: 'type',
// 						accessor: 'type',
// 						Cell: (
// 							cellProps: CellProps<
// 								HistoricalStakingTransaction,
// 								HistoricalStakingTransaction['type']
// 							>
// 						) => <div>{cellProps.value}</div>,
// 						sortable: true,
// 						width: 200,
// 					},
// 					{
// 						Header: 'amount',
// 						accessor: 'value',
// 						Cell: (
// 							cellProps: CellProps<
// 								HistoricalStakingTransaction,
// 								HistoricalStakingTransaction['value']
// 							>
// 						) => (
// 							<div>
// 								{formatCurrency(SYNTHS_MAP.sUSD, cellProps.value, {
// 									currencyKey: SYNTHS_MAP.sUSD,
// 								})}
// 							</div>
// 						),
// 						sortable: true,
// 						width: 200,
// 					},
// 					{
// 						Header: 'timestamp',
// 						accessor: 'timestamp',
// 						Cell: (
// 							cellProps: CellProps<
// 								HistoricalStakingTransaction,
// 								HistoricalStakingTransaction['timestamp']
// 							>
// 						) => <div>{formatShortDate(cellProps.value)}</div>,
// 						sortable: true,
// 						width: 200,
// 					},
// 					{
// 						Header: 'tx',
// 						id: 'link',
// 						Cell: (cellProps: CellProps<HistoricalStakingTransaction>) =>
// 							etherscanInstance != null && cellProps.row.original.hash ? (
// 								<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.hash)}>
// 									View
// 								</StyledExternalLink>
// 							) : (
// 								NO_VALUE
// 							),
// 						sortable: false,
// 					},
// 				]}
// 				data={EscrowTable}
// 				columnsDeps={[etherscanInstance]}
// 				isLoading={!isLoaded}
// 				noResultsMessage={
// 					isLoaded && EscrowTable.length === 0 ? (
// 						<TableNoResults>
// 							<Svg src={NoNotificationIcon} />
// 							{t('synths.synths.table.no-results')}
// 						</TableNoResults>
// 					) : undefined
// 				}
// 				showPagination={true}
// 			/>
// 		</>
// 	);
// };

// const StyledTable = styled(Table)`
// 	margin-top: 16px;
// `;

// const TableNoResults = styled(GridDivCenteredRow)`
// 	padding: 50px 0;
// 	justify-content: center;
// 	background-color: ${(props) => props.theme.colors.mediumBlue};
// 	margin-top: -2px;
// 	justify-items: center;
// 	grid-gap: 10px;
// `;

// const StyledExternalLink = styled(ExternalLink)`
// 	margin-left: auto;
// `;

// export default EscrowTable;
