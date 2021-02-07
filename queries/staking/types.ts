export enum StakingTransactionType {
	Issued = 'issued',
	Burned = 'burned',
	FeesClaimed = 'feesClaimed',
}

export type HistoricalStakingTransaction = {
	account: string;
	block: number;
	hash: string;
	value: number;
	timestamp: number;
	type: StakingTransactionType;
	rewards?: number;
};