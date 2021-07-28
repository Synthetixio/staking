export const GWEI_UNIT = 1000000000;
export const TokenAllowanceLimit = 100000000;
export enum Transaction {
	PRESUBMIT = 'PRESUBMIT',
	WAITING = 'WAITING',
	FAILED = 'FAILED',
	SUCCESS = 'SUCCESS',
}
export type GasLimitEstimate = number | null | void;
