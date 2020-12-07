import { FC, ReactNode, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { useRecoilValue } from 'recoil';

import synthetix from 'lib/synthetix';

import { Svg } from 'react-optimized-image';

import { appReadyState } from 'store/app';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { FlexDivCol, FlexDivRowCentered, GridDivCenteredRow, ExternalLink } from 'styles/common';
import { SynthBalance } from 'queries/walletBalances/useSynthsBalancesQuery';

import Table from 'components/Table';
import Currency from 'components/Currency';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';
import Button from 'components/Button';

import SynthPriceCol from './components/SynthPriceCol';
import SynthHolding from './components/SynthHolding';
import { EXTERNAL_LINKS } from 'constants/links';
import { SYNTHS_MAP } from 'constants/currency';

type AssetsTableProps = {
	title: ReactNode;
	assets: SynthBalance[];
	totalValue: BigNumber;
	isLoading: boolean;
	isLoaded: boolean;
	showConvert: boolean;
	showHoldings: boolean;
};

const AssetsTable: FC<AssetsTableProps> = ({
	assets,
	totalValue,
	isLoading,
	isLoaded,
	title,
	showHoldings,
	showConvert,
}) => {
	const { t } = useTranslation();
	const isAppReady = useRecoilValue(appReadyState);

	const assetColumns = useMemo(() => {
		const columns = [
			{
				Header: <StyledTableHeader>{t('synths.synths.table.asset')}</StyledTableHeader>,
				accessor: 'currencyKey',
				Cell: (cellProps: CellProps<SynthBalance, SynthBalance['currencyKey']>) => (
					<FlexDivRowCentered>
						<Currency.Icon currencyKey={cellProps.value} />
						<FlexDivCol>
							<CurrencyKey primary={true}>{cellProps.value}</CurrencyKey>
							<CurrencyKey>
								{synthetix.synthsMap != null
									? synthetix.synthsMap[cellProps.value]?.description
									: ''}
							</CurrencyKey>
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
				Cell: (cellProps: CellProps<SynthBalance, SynthBalance['balance']>) => (
					<FlexDivCol>
						<Balance primary={true}>{formatNumber(cellProps.value)}</Balance>
						<Balance>
							{formatCurrency(cellProps.row.original.currencyKey, cellProps.value, {
								sign: '$',
							})}
						</Balance>
					</FlexDivCol>
				),
				width: 200,
				sortable: true,
			},
			{
				Header: <StyledTableHeader>{t('synths.synths.table.price')}</StyledTableHeader>,
				id: 'price',
				sortType: 'basic',
				Cell: (cellProps: CellProps<SynthBalance>) => (
					<SynthPriceCol currencyKey={cellProps.row.original.currencyKey} />
				),
				width: 200,
				sortable: false,
			},
		];
		if (showHoldings) {
			columns.push({
				Header: <StyledTableHeader>{t('synths.synths.table.holdings')}</StyledTableHeader>,
				id: 'usdBalance',
				sortType: 'basic',
				Cell: (cellProps: CellProps<SynthBalance>) => (
					<SynthHolding
						usdBalance={cellProps.row.original.usdBalance}
						totalUSDBalance={totalValue ?? zeroBN}
					/>
				),
				width: 200,
				sortable: false,
			});
		}
		if (showConvert) {
			columns.push({
				Header: <></>,
				accessor: 'holdings',
				sortType: 'basic',
				Cell: (cellProps: CellProps<SynthBalance>) => (
					<ExternalLink
						href={EXTERNAL_LINKS.Trading.OneInchLink(
							cellProps.row.original.currencyKey,
							SYNTHS_MAP.sUSD
						)}
					>
						<ConvertButton variant="secondary">{t('common.convert')}</ConvertButton>
					</ExternalLink>
				),
				width: 200,
				sortable: false,
			});
		}
		return columns;
	}, [showHoldings, showConvert, t, totalValue]);

	return (
		<Container>
			<Header>{title}</Header>
			<StyledTable
				palette="primary"
				columns={assetColumns}
				data={assets}
				isLoading={isLoading}
				noResultsMessage={
					isLoaded && assets.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('synths.synths.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				columnsDeps={[isAppReady, totalValue]}
				showPagination={true}
			/>
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 20px;
`;

const StyledTable = styled(Table)`
	.table-body-cell {
		height: 70px;
	}
`;

const Header = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 16px;
	padding-bottom: 20px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.borderSilver};
	text-transform: uppercase;
	font-size: 12px;
`;

const Balance = styled.span<{ primary?: boolean }>`
	color: ${(props) => (props.primary ? props.theme.colors.white : props.theme.colors.silver)};
	font-family: ${(props) =>
		props.primary ? props.theme.fonts.condensedBold : props.theme.fonts.condensedMedium};
	font-size: 12px;
	padding-bottom: 1px;
`;

const CurrencyKey = styled.span<{ primary?: boolean }>`
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

const ConvertButton = styled(Button)`
	text-transform: uppercase;
	padding-left: 30px;
	padding-right: 30px;
`;

export default AssetsTable;
