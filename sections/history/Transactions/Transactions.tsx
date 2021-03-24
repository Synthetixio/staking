import { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/BlockExplorer';

import Table from 'components/Table';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';

import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';

import { HistoricalStakingTransaction, StakingTransactionType } from 'queries/staking/types';

import { ExternalLink, FlexDivCentered } from 'styles/common';
import { NO_VALUE } from 'constants/placeholder';
import { CryptoCurrency, Synths } from 'constants/currency';

import TypeIcon from '../TypeIcon';

type TransactionsProps = {
	transactions: HistoricalStakingTransaction[];
	isLoaded: boolean;
	noResultsMessage?: ReactNode;
};

const Transactions: FC<TransactionsProps> = ({ transactions, isLoaded, noResultsMessage }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = Etherscan.useContainer();

	const columns = useMemo(
		() => [
			{
				Header: <>{t('history.table.type')}</>,
				accessor: 'type',
				Cell: (
					cellProps: CellProps<HistoricalStakingTransaction, HistoricalStakingTransaction['type']>
				) => (
					<TypeContainer>
						<TypeIconContainer>{<TypeIcon type={cellProps.value} />}</TypeIconContainer>
						{t(`history.table.staking-tx-type.${cellProps.value}`)}
					</TypeContainer>
				),
				sortable: true,
				width: 200,
			},
			{
				Header: <>{t('history.table.amount')}</>,
				accessor: 'value',
				Cell: (
					cellProps: CellProps<HistoricalStakingTransaction, HistoricalStakingTransaction['value']>
				) => (
					<div>
						{formatCurrency(Synths.sUSD, cellProps.value, {
							currencyKey: Synths.sUSD,
						})}
						{cellProps.row.original.type === StakingTransactionType.FeesClaimed &&
							cellProps.row.original.rewards != null && (
								<>
									{' / '}
									{formatCurrency(CryptoCurrency.SNX, cellProps.row.original.rewards, {
										currencyKey: CryptoCurrency.SNX,
									})}
								</>
							)}
					</div>
				),
				sortable: true,
				width: 200,
			},
			{
				Header: <>{t('history.table.date')}</>,
				accessor: 'timestamp',
				Cell: (
					cellProps: CellProps<
						HistoricalStakingTransaction,
						HistoricalStakingTransaction['timestamp']
					>
				) => <div>{formatShortDate(cellProps.value)}</div>,
				sortable: true,
				width: 200,
			},
			{
				Header: <>{t('history.table.view-tx')}</>,
				id: 'link',
				Cell: (cellProps: CellProps<HistoricalStakingTransaction>) =>
					blockExplorerInstance != null && cellProps.row.original.hash ? (
						<StyledExternalLink href={blockExplorerInstance.txLink(cellProps.row.original.hash)}>
							{t('common.explorers.etherscan')} <Svg src={ArrowRightIcon} />
						</StyledExternalLink>
					) : (
						NO_VALUE
					),
				sortable: false,
			},
		],
		[blockExplorerInstance, t]
	);

	return (
		<>
			<StyledTable
				palette="primary"
				columns={columns}
				data={transactions}
				isLoading={!isLoaded}
				noResultsMessage={noResultsMessage}
				showPagination={true}
			/>
		</>
	);
};

const StyledTable = styled(Table)`
	margin-top: 16px;

	.table-row,
	.table-body-row {
		& > :last-child {
			justify-content: flex-end;
		}
	}
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
	display: inline-grid;
	align-items: center;
	grid-gap: 5px;
	grid-auto-flow: column;
`;

const TypeContainer = styled(FlexDivCentered)`
	text-transform: capitalize;
`;

const TypeIconContainer = styled.span`
	width: 50px;
	text-align: center;
	margin-left: -10px;
`;

export default Transactions;
