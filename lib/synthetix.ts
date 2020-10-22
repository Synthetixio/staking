import initSynthetixJS, { NetworkId, Network, Token, Synth, SynthetixJS } from '@synthetixio/js';
import { ethers, Signer } from 'ethers';

import keyBy from 'lodash/keyBy';

export const SUPPORTED_NETWORKS = {
	[NetworkId.Mainnet]: Network.Mainnet,
	[NetworkId.Kovan]: Network.Kovan,
	[NetworkId.Ropsten]: Network.Ropsten,
	[NetworkId.Rinkeby]: Network.Rinkeby,
};

export type Feed = {
	asset: string;
	category: string;
	description?: string;
	exchange?: string;
	feed?: string;
	sign: string;
};

export type SynthsMap = Record<string, Synth>;

export type TokensMap = Record<string, Token>;

type ContractSettings = {
	networkId: NetworkId;
	provider?: ethers.providers.Provider;
	signer?: Signer;
};

type Synthetix = {
	js: SynthetixJS | null;
	setContractSettings: (contractSettings: ContractSettings) => void;
	synthsMap: SynthsMap | null;
	tokensMap: TokensMap | null;
	synthSummaryUtil: ethers.Contract | null;
};

const synthetix: Synthetix = {
	js: null,
	synthSummaryUtil: null,
	synthsMap: null,
	tokensMap: null,

	setContractSettings({ networkId, provider, signer }: ContractSettings) {
		this.js = initSynthetixJS({ networkId, provider, signer });

		this.synthsMap = keyBy(this.js.synths, 'name');
		this.tokensMap = keyBy(this.js.tokens, 'symbol');
	},
};

export type { Synth };
export default synthetix;
