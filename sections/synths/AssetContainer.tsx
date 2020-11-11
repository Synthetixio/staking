import React from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import synthetix from 'lib/synthetix';

import { Svg } from 'react-optimized-image';
import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import { useTranslation } from 'react-i18next';
import { FlexDivCol, FlexDivRowCentered, GridDivCenteredRow } from 'styles/common';
import useSynthsBalancesQuery, {
	SynthBalance,
} from 'queries/walletBalances/useSynthsBalancesQuery';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { formatCurrency, formatNumber } from 'utils/formatters/number';
import SynthPriceCol from './components/SynthPriceCol';
import SynthHolding from './components/SynthHolding';

interface AssetContainerProps {
	title: React.ReactNode;
}

export const AssetContainer: React.FC<AssetContainerProps> = ({ title }) => {
	const { t } = useTranslation();

	const synthsBalancesQuery = useSynthsBalancesQuery();

	const assets = synthsBalancesQuery?.data?.balances ?? [];

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	return (
		<>
			<Header>{title}</Header>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: <StyledTableHeader>{t('synths.synths.table.asset')}</StyledTableHeader>,
						accessor: 'asset',
						Cell: (cellProps: CellProps<SynthBalance>) => (
							<FlexDivRowCentered>
								<CurrencyIcon currencyKey={cellProps.row.original.currencyKey} />
								<FlexDivCol>
									<StyledCurrencyKey primary>
										{cellProps.row.original.currencyKey}
									</StyledCurrencyKey>
									<StyledCurrencyKey>
										{synthetix.synthsMap != null
											? synthetix.synthsMap[cellProps.row.original.currencyKey]?.description
											: ''}
									</StyledCurrencyKey>
								</FlexDivCol>
							</FlexDivRowCentered>
						),
						sortable: true,
						width: 200,
					},
					{
						Header: <StyledTableHeader>{t('synths.synths.table.balance')}</StyledTableHeader>,
						accessor: 'balance',
						sortType: 'basic',
						Cell: (cellProps: CellProps<SynthBalance>) => (
							<FlexDivCol>
								<StyledBalance primary>
									{formatNumber(cellProps.row.original.balance)}
								</StyledBalance>
								<StyledBalance>
									{formatCurrency(
										cellProps.row.original.currencyKey,
										cellProps.row.original.balance,
										{ sign: '$' }
									)}
								</StyledBalance>
							</FlexDivCol>
						),
						width: 200,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('synths.synths.table.price')}</StyledTableHeader>,
						accessor: 'price',
						sortType: 'basic',
						Cell: (cellProps: CellProps<SynthBalance>) => (
							<SynthPriceCol currencyKey={cellProps.row.original.currencyKey} />
						),
						width: 200,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('synths.synths.table.holdings')}</StyledTableHeader>,
						accessor: 'holdings',
						sortType: 'basic',
						Cell: (cellProps: CellProps<SynthBalance>) => (
							<SynthHolding
								usdBalance={cellProps.row.original.usdBalance}
								totalUSDBalance={synthBalances?.totalUSDBalance ?? 0}
							/>
						),
						width: 200,
						sortable: true,
					},
				]}
				data={assets}
				isLoading={synthsBalancesQuery.isLoading}
				noResultsMessage={
					synthsBalancesQuery.isSuccess && assets.length === 0 ? (
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

const Header = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 16px;
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.borderSilver};
	text-transform: uppercase;
	font-size: 12px;
`;

const StyledBalance = styled.span<{ primary?: boolean }>`
	color: ${(props) => (props.primary ? props.theme.colors.white : props.theme.colors.silver)};
	font-family: ${(props) =>
		props.primary ? props.theme.fonts.condensedBold : props.theme.fonts.condensedMedium};
	font-size: 12px;
`;

const StyledCurrencyKey = styled.span<{ primary?: boolean }>`
	color: ${(props) => (props.primary ? props.theme.colors.white : props.theme.colors.silver)};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	padding-left: 8px;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;
