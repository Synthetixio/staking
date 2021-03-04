import { keyBy } from 'lodash';

export const GWEI_UNIT = 1000000000;
export const TokenAllowanceLimit = 100000000;
export enum Transaction {
	PRESUBMIT = 'PRESUBMIT',
	WAITING = 'WAITING',
	FAILED = 'FAILED',
	SUCCESS = 'SUCCESS',
}

export const CHAINS: string[] = ['L1', 'L2'];
export const CHAINS_MAP = keyBy(CHAINS);
