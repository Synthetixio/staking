export const GWEI_UNIT = 1000000000;
export const TokenAllowanceLimit = 100000000;
export const MAX_BLOCK_SIZE = 7920028; // 8999999; metamask mobile has a max value set of 7920028
export const DEFAULT_GAS_PRICE = 0;
export enum Transaction {
	PRESUBMIT = 'PRESUBMIT',
	WAITING = 'WAITING',
	FAILED = 'FAILED',
	SUCCESS = 'SUCCESS',
}
export type GasLimitEstimate = number | null | void;
