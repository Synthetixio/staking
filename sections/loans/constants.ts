import { ethers } from 'ethers';
import { Synths } from 'constants/currency';

export const DEBT_ASSETS: Array<string> = ['sUSD', 'sETH', 'sBTC'];

export const COLLATERAL_ASSETS: Array<string> = ['renBTC', 'ETH'];

export const LOAN_TYPE_ERC20 = 'erc20';
export const LOAN_TYPE_ETH = 'eth';

export const SAFE_MIN_CRATIO = 1.5;

export const SYNTH_BY_CURRENCY_KEY = {
	[ethers.utils.formatBytes32String(Synths.sUSD)]: Synths.sUSD,
	[ethers.utils.formatBytes32String(Synths.sBTC)]: Synths.sBTC,
	[ethers.utils.formatBytes32String(Synths.sETH)]: Synths.sETH,
};
