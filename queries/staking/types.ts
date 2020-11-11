export type HistoricalUserTransactionEvent =
	| 'issued'
	| 'burned'
	| 'feesClaimed'
	| 'exchanged'
	| 'cleared'
	| 'bought'
	| 'deposit'
	| 'withdrawl'
	| 'removal';

export type HistoricalStakingTransaction = {
	account: string;
	block: number;
	hash: string;
	value: number;
	timestamp: number;
	type: HistoricalUserTransactionEvent;
};
