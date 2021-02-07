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

export type HistoricalDebtSnapshot = {
    account: string;
    balanceOf: number;
    block: number;
    collateral: number;
	debtBalanceOf:number;
    id: string;
    timestamp: number;
};
