import Wei, { wei } from '@synthetixio/wei';

export const GWEI_PRECISION = 9;

export const TokenAllowanceLimit = wei(100000000);
export enum Transaction {
	PRESUBMIT = 'PRESUBMIT',
	WAITING = 'WAITING',
	FAILED = 'FAILED',
	SUCCESS = 'SUCCESS',
}
export type GasLimitEstimate = Wei | null;
