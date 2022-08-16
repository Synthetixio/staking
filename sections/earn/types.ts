import { CryptoCurrency, Synths } from 'constants/currency';
import ROUTES from 'constants/routes';
import { invert } from 'lodash';

export enum Tab {
  Claim = 'claim',
  sUSD_LP = 'susd-LP',
  sEURO_LP = 'seuro-lp',
  iETH_LP = 'iETH-LP',
  sTLSA_LP = 'sTSLA-LP',
  sFB_LP = 'sFB-LP',
  sAAPL_LP = 'sAAPL-LP',
  sAMZN_LP = 'sAMZN-LP',
  sNFLX_LP = 'sNFLX-LP',
  sGOOG_LP = 'sGOOG-LP',
  sMSFT_LP = 'sMSFT-LP',
  sCOIN_LP = 'sCOIN-LP',
  DHT_LP = 'DHT-LP',
  sBTC_SHORT = 'sBTC Short',
  sETH_SHORT = 'sETH Short',
  iBTC_LP = 'iBTC-LP',
  yearn_SNX_VAULT = 'yearn-SNX',
  LIQUIDATION_REWARDS = 'liquidation',
}

export enum LP {
  CURVE_sUSD = 'sUSD CPT',
  CURVE_sEURO = 'sEURO CPT',
  BALANCER_sTSLA = 'sTSLA BPT',
  BALANCER_sFB = 'sFB BPT',
  BALANCER_sAAPL = 'sAAPL BPT',
  BALANCER_sAMZN = 'sAMZN BPT',
  BALANCER_sNFLX = 'sNFLX BPT',
  BALANCER_sGOOG = 'sGOOG BPT',
  BALANCER_sMSFT = 'sMSFT BPT',
  BALANCER_sCOIN = 'sCOIN BPT',
  UNISWAP_DHT = 'DHT LPT',
  YEARN_SNX_VAULT = 'yvSNX',
}

export const lpToTab: { [name: string]: Tab } = {
  [LP.BALANCER_sTSLA]: Tab.sTLSA_LP,
  [LP.BALANCER_sFB]: Tab.sFB_LP,
  [LP.BALANCER_sAAPL]: Tab.sAAPL_LP,
  [LP.BALANCER_sAMZN]: Tab.sAMZN_LP,
  [LP.BALANCER_sNFLX]: Tab.sNFLX_LP,
  [LP.BALANCER_sGOOG]: Tab.sGOOG_LP,
  [LP.BALANCER_sMSFT]: Tab.sMSFT_LP,
  [LP.BALANCER_sCOIN]: Tab.sCOIN_LP,
  [LP.YEARN_SNX_VAULT]: Tab.yearn_SNX_VAULT,
};

export const tabToLP = invert(lpToTab);

export const lpToSynthTranslationKey: { [name: string]: string } = {
  [LP.BALANCER_sTSLA]: 'stsla',
  [LP.BALANCER_sFB]: 'sfb',
  [LP.BALANCER_sAAPL]: 'saaple',
  [LP.BALANCER_sAMZN]: 'samzn',
  [LP.BALANCER_sNFLX]: 'snflx',
  [LP.BALANCER_sGOOG]: 'sgoog',
  [LP.BALANCER_sMSFT]: 'smsft',
  [LP.BALANCER_sCOIN]: 'scoin',
  [LP.YEARN_SNX_VAULT]: 'yvsnx',
};

export const lpToSynthIcon: { [name: string]: string } = {
  [LP.BALANCER_sTSLA]: Synths.sTSLA,
  [LP.BALANCER_sFB]: Synths.sFB,
  [LP.BALANCER_sAAPL]: Synths.sAAPL,
  [LP.BALANCER_sAMZN]: Synths.sAMZN,
  [LP.BALANCER_sNFLX]: Synths.sNFLX,
  [LP.BALANCER_sGOOG]: Synths.sGOOG,
  [LP.BALANCER_sMSFT]: Synths.sMSFT,
  [LP.BALANCER_sCOIN]: Synths.sCOIN,
  [LP.YEARN_SNX_VAULT]: CryptoCurrency.YVSNX,
};

export const lpToRoute: { [name: string]: string } = {
  [LP.BALANCER_sTSLA]: ROUTES.Earn.sTLSA_LP,
  [LP.BALANCER_sFB]: ROUTES.Earn.sFB_LP,
  [LP.BALANCER_sAAPL]: ROUTES.Earn.sAAPL_LP,
  [LP.BALANCER_sAMZN]: ROUTES.Earn.sAMZN_LP,
  [LP.BALANCER_sNFLX]: ROUTES.Earn.sNFLX_LP,
  [LP.BALANCER_sGOOG]: ROUTES.Earn.sGOOG_LP,
  [LP.BALANCER_sMSFT]: ROUTES.Earn.sMSFT_LP,
  [LP.BALANCER_sCOIN]: ROUTES.Earn.sCOIN_LP,
  [LP.YEARN_SNX_VAULT]: ROUTES.Earn.yearn_SNX_VAULT,
};
