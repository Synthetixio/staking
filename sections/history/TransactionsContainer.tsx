import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ValueType } from 'react-select';
import { useRecoilValue } from 'recoil';
import orderBy from 'lodash/orderBy';
import keyBy from 'lodash/keyBy';

import { isWalletConnectedState } from 'store/wallet';

import { HistoricalStakingTransaction, StakingTransactionType } from 'queries/staking/types';

import DateSelect from 'components/DateSelect';
import Select from 'components/Select';
import Button from 'components/Button';

import { formatShortDate } from 'utils/formatters/date';
import { formatNumber } from 'utils/formatters/number';

import { CapitalizedText, GridDiv, GridDivCenteredRow } from 'styles/common';

import Transactions from './Transactions';
import {
	TypeFilterOptionType,
	TransactionsContainerProps,
	AmountFilterOptionType,
	AmountFilterType,
} from './types';

import CustomTypeOption from './CustomTypeOption';

const TransactionsContainer: FC<TransactionsContainerProps> = ({
	issued,
	burned,
	feesClaimed,
	isLoaded,
}) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const [typeFilter, setTypeFilter] = useState<ValueType<TypeFilterOptionType>>();
	const [dateFilter, setDateFilter] = useState<{
		startDate: Date | null;
		endDate: Date | null;
	}>({
		startDate: new Date(),
		endDate: null,
	});
	const [amountFilter, setAmountFilter] = useState<ValueType<AmountFilterOptionType>>();

	const typeFilterList = useMemo(
		() => [
			{ label: t('history.table.staking-tx-type.issued'), value: StakingTransactionType.Issued },
			{ label: t('history.table.staking-tx-type.burned'), value: StakingTransactionType.Burned },
			{
				label: t('history.table.staking-tx-type.feesClaimed'),
				value: StakingTransactionType.FeesClaimed,
			},
		],
		[t]
	);

	const amountFilterList = useMemo(
		() => [
			{ label: t('history.table.filters.amount.no-selection'), value: null },
			{
				label: t('history.table.filters.amount.less-than-num', {
					num: formatNumber(1000, { decimals: 0 }),
				}),
				value: AmountFilterType.LESS_THAN_1K,
			},
			{
				label: t('history.table.filters.amount.between-num1-and-num2', {
					num1: formatNumber(1000, { decimals: 0 }),
					num2: formatNumber(10000, { decimals: 0 }),
				}),
				value: AmountFilterType.BETWEEN_1K_AND_10K,
			},
			{
				label: t('history.table.filters.amount.between-num1-and-num2', {
					num1: formatNumber(10000, { decimals: 0 }),
					num2: formatNumber(100000, { decimals: 0 }),
				}),
				value: AmountFilterType.BETWEEN_10K_AND_100K,
			},
			{
				label: t('history.table.filters.amount.greater-than-num', {
					num: formatNumber(100000, { decimals: 0 }),
				}),
				value: AmountFilterType.GREATER_THAN_100K,
			},
		],
		[t]
	);

	const filteredTransactions = useMemo(() => {
		let transactions: HistoricalStakingTransaction[] = [];

		if (isLoaded) {
			if (Array.isArray(typeFilter) && typeFilter.length) {
				const filters = Object.keys(keyBy(typeFilter, 'value')) as StakingTransactionType[];

				if (filters.includes(StakingTransactionType.Issued)) {
					transactions.push(...issued);
				}
				if (filters.includes(StakingTransactionType.Burned)) {
					transactions.push(...burned);
				}
				if (filters.includes(StakingTransactionType.FeesClaimed)) {
					transactions.push(...feesClaimed);
				}
			} else {
				transactions = [...issued, ...burned, ...feesClaimed];
			}

			if (dateFilter.startDate != null && dateFilter.endDate != null) {
				const startDate = dateFilter.startDate.getTime();
				const endDate = dateFilter.endDate.getTime();

				transactions = transactions.filter(
					(transaction) => transaction.timestamp >= startDate && transaction.timestamp <= endDate
				);
			}

			if (amountFilter != null) {
				transactions = transactions.filter((transaction) => {
					switch ((amountFilter as AmountFilterOptionType).value) {
						case AmountFilterType.LESS_THAN_1K:
							return transaction.value <= 1000;
						case AmountFilterType.BETWEEN_1K_AND_10K:
							return 1000 < transaction.value && transaction.value <= 10000;
						case AmountFilterType.BETWEEN_10K_AND_100K:
							return 10000 < transaction.value && transaction.value <= 100000;
						case AmountFilterType.GREATER_THAN_100K:
							return transaction.value >= 100000;
						default:
							return true;
					}
				});
			}
		}
		return transactions.length ? orderBy(transactions, 'timestamp', 'desc') : transactions;
	}, [issued, burned, feesClaimed, isLoaded, typeFilter, dateFilter, amountFilter]);

	const dateFilterSelectedDates = useMemo(
		() => dateFilter.startDate != null && dateFilter.endDate != null,
		[dateFilter.startDate, dateFilter.endDate]
	);

	const dateFilterRange = useMemo(() => {
		if (dateFilter.startDate != null && dateFilter.endDate != null) {
			return `${formatShortDate(dateFilter.startDate)} – ${formatShortDate(dateFilter.endDate)}`;
		}
		return t('history.table.filters.date.no-selection');
	}, [dateFilter.startDate, dateFilter.endDate, t]);

	const filtersEnabled = useMemo(
		() => dateFilterSelectedDates || amountFilter != null || typeFilter != null,
		[dateFilterSelectedDates, amountFilter, typeFilter]
	);

	const resetFilters = () => {
		setAmountFilter(null);
		setTypeFilter(null);
		setDateFilter({
			startDate: new Date(),
			endDate: null,
		});
	};

	return (
		<>
			<Filters>
				<Select
					inputId="type-filter-list"
					formatOptionLabel={(option: TypeFilterOptionType) => (
						<CapitalizedText>{option.label}</CapitalizedText>
					)}
					options={typeFilterList}
					value={typeFilter}
					onChange={(option: ValueType<TypeFilterOptionType>) => {
						setTypeFilter(option);
					}}
					isMulti={true}
					isSearchable={false}
					isClearable={false}
					placeholder={t('history.table.filters.type.no-selection')}
					components={{
						Option: CustomTypeOption,
					}}
				/>
				<DateSelect
					id="tx-date-filter"
					startDate={dateFilter.startDate}
					endDate={dateFilter.endDate}
					selected={dateFilter.startDate}
					onChange={(dates) => {
						// @ts-ignore
						const [startDate, endDate] = dates;

						setDateFilter({
							startDate,
							endDate,
						});
					}}
					value={dateFilterRange}
					selectsRange={true}
					onClear={() => {
						setDateFilter({
							startDate: new Date(),
							endDate: null,
						});
					}}
					showClear={dateFilterSelectedDates}
				/>
				<Select
					inputId="order-amount-list"
					formatOptionLabel={(option: AmountFilterOptionType) => (
						<CapitalizedText>{option.label}</CapitalizedText>
					)}
					options={amountFilterList}
					value={amountFilter}
					onChange={(option: ValueType<AmountFilterOptionType>) => {
						if (option) {
							setAmountFilter(option);
						}
					}}
					isSearchable={false}
					placeholder={t('history.table.filters.amount.no-selection')}
				/>
			</Filters>
			<Transactions
				transactions={filteredTransactions}
				isLoaded={isWalletConnected ? isLoaded : true}
				noResultsMessage={
					!isWalletConnected ? (
						<TableNoResults>{t('history.table.connect-wallet-to-view')}</TableNoResults>
					) : isLoaded && filtersEnabled && filteredTransactions.length === 0 ? (
						<TableNoResults>
							<div>{t('history.table.no-results')}</div>
							<ResetFiltersButton variant="primary" onClick={resetFilters}>
								{t('history.table.view-all-transactions')}
							</ResetFiltersButton>
						</TableNoResults>
					) : isLoaded && filteredTransactions.length === 0 ? (
						<TableNoResults>{t('history.table.no-transactions')}</TableNoResults>
					) : undefined
				}
			/>
		</>
	);
};

const Filters = styled(GridDiv)`
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 18px;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.navy};
	justify-items: center;
	grid-gap: 10px;
`;

const ResetFiltersButton = styled(Button)`
	margin-top: 20px;
`;

export default TransactionsContainer;
