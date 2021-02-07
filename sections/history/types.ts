import { HistoricalStakingTransaction, StakingTransactionType } from 'queries/staking/types';
import { HistoricalDebtSnapshot } from 'queries/debt/useDebtSnapshotHistoryQuery'

export type TransactionsContainerProps = {
	issued: HistoricalStakingTransaction[];
	burned: HistoricalStakingTransaction[];
	feesClaimed: HistoricalStakingTransaction[];
	isLoaded: boolean;
};

export type DebtHistoryContainerProps = {
	issued: HistoricalStakingTransaction[];
	burned: HistoricalStakingTransaction[];
	debtHistory: HistoricalDebtSnapshot[];
	currentDebt: number;
	totalSynthUSD: number;
	sUSDRate: number;
	isLoaded: boolean;
};

export enum AmountFilterType {
	LESS_THAN_1K,
	BETWEEN_1K_AND_10K,
	BETWEEN_10K_AND_100K,
	GREATER_THAN_100K,
}

export type AmountFilterOptionType = {
	label: string;
	value: AmountFilterType | null;
};

export type TypeFilterOptionType = {
	label: string;
	value: StakingTransactionType | null;
};
