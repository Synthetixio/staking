import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';

import useEscrowDataQuery, { EscrowData } from 'queries/escrow/useEscrowDataQuery';
import { CryptoCurrency } from 'constants/currency';
import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import {
	Container,
	Data,
	Header,
	StyledLink,
	StyledTable,
	Subtitle,
	TableNoResults,
	Title,
} from 'sections/escrow/components/common';

const RewardEscrowSchedule: React.FC = () => {
	const { t } = useTranslation();
	const escrowDataQuery = useEscrowDataQuery();
	const escrowData = escrowDataQuery.data;
	const data = escrowData?.schedule;

	return (
		<Container>
			<Title>{t('escrow.staking.info.title')}</Title>
			<Subtitle>
				<Trans i18nKey="escrow.staking.info.subtitle" components={[<StyledLink />]} />
			</Subtitle>
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
				isLoading={escrowDataQuery.isLoading}
				noResultsMessage={
					!escrowDataQuery.isLoading && data?.length === 0 ? (
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

export default RewardEscrowSchedule;
