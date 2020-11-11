export type HistoricalUserTransactionEvent = 'issued' | 'burned' | 'feesClaimed';

export type HistoricalStakingTransaction = {
	account: string;
	block: number;
	hash: string;
	value: number;
	timestamp: number;
	type: HistoricalUserTransactionEvent;
};
