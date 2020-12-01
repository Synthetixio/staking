import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import orderBy from 'lodash/orderBy';

import { HistoricalStakingTransaction, StakingTransactionType } from 'queries/staking/types';

import Transactions from './Transactions';
import styled from 'styled-components';
import DateSelect from 'components/DateSelect';
import { formatShortDate } from 'utils/formatters/date';

type TransactionsContainerProps = {
	issued: HistoricalStakingTransaction[];
	burned: HistoricalStakingTransaction[];
	feesClaimed: HistoricalStakingTransaction[];
	isLoaded: boolean;
};
const TransactionsContainer: FC<TransactionsContainerProps> = ({
	issued,
	burned,
	feesClaimed,
	isLoaded,
}) => {
	const { t } = useTranslation();

	const [typeFilter, setTypeFilter] = useState<StakingTransactionType | null>(null);
	const [dateFilter, setDateFilter] = useState<{
		startDate: Date | null;
		endDate: Date | null;
	}>({
		startDate: new Date(),
		endDate: null,
	});
	const [amountFilter, setAmountFilter] = useState<{ minValue: number; maxValue?: number } | null>(
		null
	);

	const filteredTransactions = useMemo(() => {
		let transactions: HistoricalStakingTransaction[] = [];

		if (isLoaded) {
			switch (typeFilter) {
				case StakingTransactionType.Issued:
					transactions = issued;
					break;
				case StakingTransactionType.Burned:
					transactions = burned;
					break;
				case StakingTransactionType.FeesClaimed:
					transactions = feesClaimed;
					break;
				default:
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
				transactions = transactions.filter(
					(transaction) =>
						transaction.value >= amountFilter.minValue &&
						(amountFilter.maxValue != null ? transaction.timestamp <= amountFilter.maxValue : true)
				);
			}
		}
		return transactions.length ? orderBy(transactions, 'timestamp', 'desc') : transactions;
	}, [issued, burned, feesClaimed, isLoaded, typeFilter, dateFilter, amountFilter]);

	const dateFilterRange = useMemo(() => {
		if (dateFilter.startDate != null && dateFilter.endDate != null) {
			return `${formatShortDate(dateFilter.startDate)} – ${formatShortDate(dateFilter.endDate)}`;
		}
		return 'All dates';
	}, [dateFilter.startDate, dateFilter.endDate]);

	return (
		<>
			<Filters>
				<StyledDateSelect
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
				/>
			</Filters>
			<Transactions transactions={filteredTransactions} isLoaded={isLoaded} />
		</>
	);
};

const Filters = styled.div``;

const StyledDateSelect = styled(DateSelect)`
	.react-datepicker__input-container {
		width: 250px;
	}
`;

export default TransactionsContainer;
