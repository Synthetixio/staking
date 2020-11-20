import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';

import { EscrowData } from 'queries/escrow/useEscrowDataQuery';

import { GridDivCenteredRow } from 'styles/common';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

interface EscrowTableProps {
	data: EscrowData['schedule'];
	isLoaded: boolean;
}

const EscrowTable: FC<EscrowTableProps> = ({ data, isLoaded }) => {
	const { t } = useTranslation();

	return (
		<>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: 'date',
						accessor: 'date',
						Cell: (cellProps: CellProps<EscrowData['schedule'], Date>) => (
							<div>{formatShortDate(cellProps.value)}</div>
						),
						sortable: true,
						width: 200,
					},
					{
						Header: 'quantity',
						accessor: 'quantity',
						Cell: (cellProps: CellProps<EscrowData['schedule'], number>) => (
							<div>{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, cellProps.value)}</div>
						),
						sortable: true,
						width: 200,
					},
				]}
				data={data}
				columnsDeps={[]}
				isLoading={!isLoaded}
				noResultsMessage={
					isLoaded && data.length === 0 ? (
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

export default EscrowTable;
