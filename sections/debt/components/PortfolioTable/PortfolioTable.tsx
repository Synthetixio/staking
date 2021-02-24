import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { useRecoilValue } from 'recoil';

import { TableNoResults, TableNoResultsTitle, FlexDiv } from 'styles/common';

import { appReadyState } from 'store/app';
import { CryptoBalance } from 'queries/walletBalances/types';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';

import { ProgressBarType } from 'components/ProgressBar/ProgressBar';

import { SynthsTotalSupplyData } from 'queries/synths/useSynthsTotalSupplyQuery';
import { zeroBN } from 'utils/formatters/number';
import SynthHolding from 'components/SynthHolding';

const SHOW_HEDGING_INDICATOR_THRESHOLD = new BigNumber(0.05);

type DebtPoolTableProps = {
	synths: any;
	synthsTotalSupply: SynthsTotalSupplyData;
	synthsTotalValue: BigNumber;
	isLoading: boolean;
	isLoaded: boolean;
};

const DebtPoolTable: FC<DebtPoolTableProps> = ({
	synths,
	isLoading,
	isLoaded,
	synthsTotalSupply,
	synthsTotalValue,
}) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const isAppReady = useRecoilValue(appReadyState);
	const assetColumns = useMemo(() => {
		if (!isAppReady) {
			return [];
		}

		const columns = [
			{
				Header: <>{t('synths.assets.synths.table.asset')}</>,
				accessor: 'currencyKey',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['currencyKey']>) => {
					return (
						<Legend>
							<Currency.Name currencyKey={cellProps.value} showIcon={true} />
						</Legend>
					);
				},

				sortable: false,
				width: 100,
			},
			{
				Header: <>{t('synths.assets.synths.table.balance')}</>,
				id: 'balance',
				accessor: (originalRow: any) => originalRow.balance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['balance']>) => (
					<Currency.Amount
						amountCurrencyKey={cellProps.row.original.currencyKey}
						amount={cellProps.value}
						valueCurrencyKey={selectedPriceCurrency.name}
						totalValue={cellProps.row.original.usdBalance}
						sign={selectedPriceCurrency.sign}
						conversionRate={selectPriceCurrencyRate}
					/>
				),
				width: 100,
				sortable: false,
			},
			{
				Header: <>{t('synths.assets.synths.table.percentage-of-portfolio')}</>,
				id: 'holdings',
				accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => {
					let variant: ProgressBarType = 'rainbow';
					if (synthsTotalSupply && synthsTotalSupply.supplyData && synthsTotalValue) {
						const { currencyKey } = cellProps.row.original;
						const poolCurrencyPercent = synthsTotalSupply.supplyData[currencyKey].poolProportion;

						if (poolCurrencyPercent) {
							const holdingPercent = synthsTotalValue.isZero()
								? zeroBN
								: cellProps.row.original.usdBalance.dividedBy(synthsTotalValue);
							const deviationFromPool = holdingPercent.minus(poolCurrencyPercent);

							if (deviationFromPool.isGreaterThanOrEqualTo(SHOW_HEDGING_INDICATOR_THRESHOLD)) {
								variant = 'red-simple';
							} else if (
								deviationFromPool.isLessThanOrEqualTo(SHOW_HEDGING_INDICATOR_THRESHOLD.negated())
							) {
								variant = 'green-simple';
							}
						}
					}

					return (
						<SynthHoldingWrapper>
							<SynthHolding
								usdBalance={cellProps.row.original.usdBalance}
								totalUSDBalance={synthsTotalValue ?? zeroBN}
								progressBarVariant={variant}
							/>
						</SynthHoldingWrapper>
					);
				},
				width: 100,
				sortable: false,
			},
			{
				Header: <>{t('synths.assets.synths.table.debt-pool-proportion')}</>,
				id: 'debt-pool-proportion',
				accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => {
					const { currencyKey } = cellProps.row.original;
					if (!synthsTotalSupply || !synthsTotalSupply.supplyData) return null;
					const totalPoolValue = synthsTotalSupply?.totalValue ?? zeroBN;
					const currencyValue = synthsTotalSupply.supplyData[currencyKey]?.value ?? zeroBN;

					return (
						<SynthHoldingWrapper>
							<SynthHolding usdBalance={currencyValue} totalUSDBalance={totalPoolValue} />
						</SynthHoldingWrapper>
					);
				},
				width: 100,
				sortable: false,
			},
		];

		return columns;
	}, [
		selectedPriceCurrency.sign,
		t,
		isAppReady,
		synthsTotalSupply,
		selectPriceCurrencyRate,
		selectedPriceCurrency.name,
		synthsTotalValue,
	]);

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

const Legend = styled(FlexDiv)`
	align-items: baseline;
`;

const SynthHoldingWrapper = styled.div`
	width: 100px;
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
