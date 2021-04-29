import { Synths } from 'constants/currency';
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
	DHT_LP = 'DHT-LP',
	sBTC_SHORT = 'sBTC Short',
	sETH_SHORT = 'sETH Short',
	iBTC_LP = 'iBTC-LP',
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
	UNISWAP_DHT = 'DHT LPT',
}

export const lpToTab: { [name: string]: Tab } = {
	[LP.BALANCER_sFB]: Tab.sFB_LP,
	[LP.BALANCER_sAAPL]: Tab.sAAPL_LP,
	[LP.BALANCER_sAMZN]: Tab.sAMZN_LP,
	[LP.BALANCER_sNFLX]: Tab.sNFLX_LP,
	[LP.BALANCER_sGOOG]: Tab.sGOOG_LP,
};

export const tabToLP = invert(lpToTab);

export const lpToSynthTranslationKey: { [name: string]: string } = {
	[LP.BALANCER_sFB]: 'sfb',
	[LP.BALANCER_sAAPL]: 'saaple',
	[LP.BALANCER_sAMZN]: 'samzn',
	[LP.BALANCER_sNFLX]: 'snflx',
	[LP.BALANCER_sGOOG]: 'sgoog',
	[LP.BALANCER_sTSLA]: 'stsla',
};

export const lpToSynthIcon: { [name: string]: string } = {
	[LP.BALANCER_sFB]: Synths.sFB,
	[LP.BALANCER_sAAPL]: Synths.sAAPL,
	[LP.BALANCER_sAMZN]: Synths.sAMZN,
	[LP.BALANCER_sNFLX]: Synths.sNFLX,
	[LP.BALANCER_sGOOG]: Synths.sGOOG,
	[LP.BALANCER_sTSLA]: Synths.sTSLA,
};
