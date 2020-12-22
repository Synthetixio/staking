import React, { useMemo } from 'react';
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
	ContainerHeader,
	ContainerBody,
	Data,
	Header,
	TableNoResults,
	StyledTable,
	Subtitle,
	Title,
} from 'sections/escrow/components/common';

const TokenSaleEscrowSchedule: React.FC = () => {
	const { t } = useTranslation();
	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery();
	const tokenSaleEscrow = tokenSaleEscrowQuery.data;

	const schedule = useMemo(() => tokenSaleEscrow?.schedule ?? [], [tokenSaleEscrow]);

	const columns = useMemo(
		() => [
			{
				Header: <Header>{t('escrow.table.vesting-date')}</Header>,
				accessor: 'date',
				Cell: (cellProps: CellProps<EscrowData['schedule'], Date>) => (
					<Data>{formatShortDate(cellProps.value)}</Data>
				),
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
				sortable: false,
			},
		],
		[t]
	);

	return (
		<Container>
			<ContainerHeader>
				<Title>{t('escrow.token.info.title')}</Title>
				<Subtitle>{t('escrow.token.info.subtitle')}</Subtitle>
			</ContainerHeader>
			<ContainerBody>
				<StyledTable
					palette="primary"
					columns={columns}
					data={schedule ? schedule : []}
					isLoading={tokenSaleEscrowQuery.isLoading}
					noResultsMessage={
						!tokenSaleEscrowQuery.isLoading && schedule?.length === 0 ? (
							<TableNoResults>
								<Svg src={NoNotificationIcon} />
								{t('escrow.table.no-results')}
							</TableNoResults>
						) : undefined
					}
					showPagination={true}
				/>
			</ContainerBody>
		</Container>
	);
};
export default TokenSaleEscrowSchedule;
