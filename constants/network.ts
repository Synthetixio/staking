import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';

export const GWEI_PRECISION = 9;

export const TokenAllowanceLimit = wei(ethers.constants.MaxUint256);
export enum Transaction {
	PRESUBMIT = 'PRESUBMIT',
	WAITING = 'WAITING',
	FAILED = 'FAILED',
	SUCCESS = 'SUCCESS',
}
export type GasLimitEstimate = Wei | null;
