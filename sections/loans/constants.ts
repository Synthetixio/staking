export const DEBT_ASSETS = ['sUSD', 'sETH'];
export const DEBT_ASSETS_L2 = ['sUSD', 'sETH'];

export const getSafeMinCRatioBuffer = (debtAsset: string, collateralAsset: string) => {
  if (collateralAsset.includes('ETH') && debtAsset.includes('sETH')) return 0.02;
  return 0.1;
};
