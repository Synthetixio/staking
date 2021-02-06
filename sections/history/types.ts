import { HistoricalStakingTransaction, StakingTransactionType, HistoricalDebtSnapshot } from 'queries/staking/types';
import BigNumber from 'bignumber.js';

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
    debtBalance: BigNumber;
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
