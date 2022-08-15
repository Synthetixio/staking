import { wei } from '@synthetixio/wei';
import { BigNumber, ethers } from 'ethers';

export const GWEI_PRECISION = 9;

export const TokenAllowanceLimit = wei(ethers.constants.MaxUint256);
export enum Transaction {
  PRESUBMIT = 'PRESUBMIT',
  WAITING = 'WAITING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}
export type GasLimitEstimate = BigNumber | null;
