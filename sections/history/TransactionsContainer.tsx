import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import orderBy from 'lodash/orderBy';

import { HistoricalStakingTransaction, StakingTransactionType } from 'queries/staking/types';

import Transactions from './Transactions';

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
	const [dateFilter, setFilterFilter] = useState<{ startDate: number; endDate: number } | null>(
		null
	);
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
			if (dateFilter != null) {
				transactions = transactions.filter(
					(transaction) =>
						transaction.timestamp >= dateFilter.startDate &&
						transaction.timestamp <= dateFilter.endDate
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

	return (
		<>
			<Transactions transactions={filteredTransactions} isLoaded={isLoaded} />
		</>
	);
};

export default TransactionsContainer;
