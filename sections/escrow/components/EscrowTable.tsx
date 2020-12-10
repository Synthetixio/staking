import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';

import { EscrowData } from 'queries/escrow/useEscrowDataQuery';

import { GridDivCenteredRow, linkCSS } from 'styles/common';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';

const EscrowTable: FC = () => {
	const { t } = useTranslation();
	const escrowDataQuery = useEscrowDataQuery();
	const escrowData = escrowDataQuery.data;

	const data = escrowData?.schedule ?? [];
	return (
		<Container>
			<Title>{t('escrow.info.title')}</Title>
			<Subtitle>
				<Trans i18nKey="escrow.info.subtitle" components={[<StyledLink />]} />
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
								{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, cellProps.value)}
							</Data>
						),
						width: 250,
						sortable: false,
					},
				]}
				data={data}
				columnsDeps={[]}
				isLoading={escrowDataQuery.isLoading}
				noResultsMessage={
					!escrowDataQuery.isLoading && data.length === 0 ? (
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

const Container = styled.div`
	background: ${(props) => props.theme.colors.navy};
	padding: 16px;
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.navy};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
`;
const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
`;
const StyledLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.blue};
`;
const Header = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	width: 50%;
`;
const Data = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	width: 50%;
`;

export default EscrowTable;
