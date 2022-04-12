import { ethers } from 'ethers';
import { Synths } from 'constants/currency';

export const DEBT_ASSETS = ['sUSD', 'sETH'];
export const DEBT_ASSETS_L2 = ['sUSD', 'sETH'];

export const COLLATERAL_ASSETS = ['renBTC', 'ETH'];
export const COLLATERAL_ASSETS_L2 = ['ETH'];

export const LOAN_TYPE_ERC20 = 'erc20';
export const LOAN_TYPE_ETH = 'eth';

export const getSafeMinCRatioBuffer = (debtAsset: string, collateralAsset: string) => {
	if (collateralAsset.includes('ETH') && debtAsset.includes('sETH')) return 0.02;
	return 0.1;
};

export const SYNTH_BY_CURRENCY_KEY = {
	[ethers.utils.formatBytes32String(Synths.sUSD)]: Synths.sUSD,
	[ethers.utils.formatBytes32String(Synths.sBTC)]: Synths.sBTC,
	[ethers.utils.formatBytes32String(Synths.sETH)]: Synths.sETH,
};
