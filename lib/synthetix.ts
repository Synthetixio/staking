import initSynthetixJS, {
	NetworkId,
	Network,
	Token,
	Synth,
	SynthetixJS,
} from '@synthetixio/contracts-interface';
import { ethers, Signer } from 'ethers';

import keyBy from 'lodash/keyBy';
import invert from 'lodash/invert';
import { normalizeGasLimit } from 'utils/network';
import { MAX_BLOCK_SIZE } from 'constants/network';

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
	useOvm?: boolean;
};

type GasEstimateForTransactionParams = {
	txArgs: any[];
	method: Function;
};

type Synthetix = {
	js: SynthetixJS | null;
	setContractSettings: (contractSettings: ContractSettings) => void;
	getGasEstimateForTransaction: (params: GasEstimateForTransactionParams) => void;
	synthsMap: SynthsMap | null;
	tokensMap: TokensMap | null;
	synthSummaryUtil: ethers.Contract | null;
	chainIdToNetwork: Record<NetworkId, Network> | null;
};

const synthetix: Synthetix = {
	js: null,
	synthSummaryUtil: null,
	synthsMap: null,
	tokensMap: null,
	chainIdToNetwork: null,

	setContractSettings({ networkId, provider, signer }: ContractSettings) {
		this.js = initSynthetixJS({
			networkId,
			provider,
			signer,
		});

		this.synthsMap = keyBy(this.js.synths, 'name');
		this.tokensMap = keyBy(this.js.tokens, 'symbol');

		// @ts-ignore
		this.chainIdToNetwork = invert(this.js.networkToChainId);
	},
	getGasEstimateForTransaction({
		txArgs,
		method,
	}: GasEstimateForTransactionParams): Promise<number> {
		return new Promise((resolve, reject) => {
			if (this.js?.network.useOvm) resolve(MAX_BLOCK_SIZE);
			method(...txArgs)
				.then((estimate: Number) => {
					resolve(normalizeGasLimit(Number(estimate)));
				})
				.catch((e: Error) => reject(e));
		});
	},
};

export type { Synth };
export default synthetix;
