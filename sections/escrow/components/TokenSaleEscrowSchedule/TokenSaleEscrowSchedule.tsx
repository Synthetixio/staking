import React from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import { CryptoCurrency } from 'constants/currency';
import { EscrowData } from 'queries/escrow/useEscrowDataQuery';
import useTokenSaleEscrowQuery from 'queries/escrow/useTokenSaleEscrowQuery';
import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';
import {
	Container,
	Data,
	Header,
	StyledTable,
	Subtitle,
	TableNoResults,
	Title,
} from 'sections/escrow/components/common';

const TokenSaleEscrowSchedule: React.FC = () => {
	const { t } = useTranslation();
	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery();
	const tokenSaleEscrow = tokenSaleEscrowQuery.data;
	const data = tokenSaleEscrow?.data ?? [];
	return (
		<Container>
			<Title>{t('escrow.token.info.title')}</Title>
			<Subtitle>{t('escrow.token.info.subtitle')}</Subtitle>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: <Header>{t('escrow.table.vesting-date')}</Header>,
						accessor: 'date',
						Cell: (cellProps: CellProps<EscrowData['schedule'], Date>) => (
							<Data>{formatShortDate(cellProps.value)}</Data>
						),
						width: 250,
						sortable: false,
					},
					{
						Header: <Header style={{ textAlign: 'right' }}>{t('escrow.table.snx-amount')}</Header>,
						accessor: 'quantity',
						Cell: (cellProps: CellProps<EscrowData['schedule'], number>) => (
							<Data style={{ textAlign: 'right' }}>
								{formatCurrency(CryptoCurrency.SNX, cellProps.value)}
							</Data>
						),
						width: 250,
						sortable: false,
					},
				]}
				data={data ? data : []}
				columnsDeps={[]}
				isLoading={tokenSaleEscrowQuery.isLoading}
				noResultsMessage={
					!tokenSaleEscrowQuery.isLoading && data?.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('escrow.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</Container>
	);
};
export default TokenSaleEscrowSchedule;
