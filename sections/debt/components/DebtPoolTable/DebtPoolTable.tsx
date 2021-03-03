import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { useRecoilValue } from 'recoil';

import { TableNoResults, TableNoResultsTitle, FlexDiv } from 'styles/common';

import { appReadyState } from 'store/app';
import { CryptoBalance } from 'queries/walletBalances/types';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';

import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';

type DebtPoolTableProps = {
	synths: any;
	isLoading: boolean;
	isLoaded: boolean;
};

const DebtPoolTable: FC<DebtPoolTableProps> = ({ synths, isLoading, isLoaded }) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const isAppReady = useRecoilValue(appReadyState);
	const assetColumns = useMemo(() => {
		if (!isAppReady) {
			return [];
		}

		const columns = [
			{
				Header: <>{t('synths.assets.synths.table.asset')}</>,
				accessor: 'name',
				Cell: (cellProps: any) => {
					return (
						<Legend>
							<LegendIcon
								strokeColor={cellProps.row.original.strokeColor}
								fillColor={cellProps.row.original.fillColor}
							/>
							<Currency.Name currencyKey={cellProps.value} showIcon={false} />
						</Legend>
					);
				},

				sortable: false,
				width: 100,
			},
			{
				Header: <>{t('synths.assets.synths.table.total')}</>,
				accessor: 'value',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<Amount>
						{formatFiatCurrency(cellProps.value, {
							sign: selectedPriceCurrency.sign,
							decimals: 0,
						})}
					</Amount>
				),
				width: 100,
				sortable: false,
			},
			{
				Header: <>{t('synths.assets.synths.table.percentage-of-pool')}</>,
				accessor: 'poolProportion',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<Amount>{formatPercent(cellProps.value)}</Amount>
				),
				width: 100,
				sortable: false,
			},
		];

		return columns;
	}, [selectedPriceCurrency.sign, t, isAppReady]);

	return (
		<StyledTable
			palette="primary"
			columns={assetColumns}
			data={synths && synths.length > 0 ? synths : []}
			isLoading={isLoading}
			noResultsMessage={
				isLoaded && synths.length === 0 ? (
					<TableNoResults>
						<TableNoResultsTitle>{t('common.table.no-data')}</TableNoResultsTitle>
					</TableNoResults>
				) : undefined
			}
			showPagination={true}
		/>
	);
};

const Amount = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Legend = styled(FlexDiv)`
	align-items: baseline;
`;

const LegendIcon = styled.span<{ strokeColor: string; fillColor: string }>`
	height: 8px;
	width: 8px;
	border: 2px solid ${(props) => props.strokeColor};
	background-color: ${(props) => props.fillColor};
	margin-right: 6px;
`;

const StyledTable = styled(Table)`
	padding: 0 10px;
	.table-body-cell {
		height: 40px;
	}
	.table-body-cell,
	.table-header-cell {
		&:last-child {
			justify-content: flex-end;
		}
	}
`;

export default DebtPoolTable;
