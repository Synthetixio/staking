import { ethers } from 'ethers';
import { Synths } from 'constants/currency';

export const DEBT_ASSETS = ['sUSD', 'sETH', 'sBTC'];
export const DEBT_ASSETS_L2 = ['sUSD', 'sETH'];

export const COLLATERAL_ASSETS = ['renBTC', 'ETH'];
export const COLLATERAL_ASSETS_L2 = ['ETH'];

export const LOAN_TYPE_ERC20 = 'erc20';
export const LOAN_TYPE_ETH = 'eth';

export const SAFE_MIN_CRATIO_BUFFER = 0.1;

export const SYNTH_BY_CURRENCY_KEY = {
	[ethers.utils.formatBytes32String(Synths.sUSD)]: Synths.sUSD,
	[ethers.utils.formatBytes32String(Synths.sBTC)]: Synths.sBTC,
	[ethers.utils.formatBytes32String(Synths.sETH)]: Synths.sETH,
};
