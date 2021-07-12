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
		try {
			this.js = initSynthetixJS({
				networkId,
				provider,
				signer,
			});

			this.synthsMap = keyBy(this.js.synths, 'name');
			this.tokensMap = keyBy(this.js.tokens, 'symbol');

			// @ts-ignore
			this.chainIdToNetwork = invert(this.js.networkToChainId);
		} catch (error) {
			throw new Error(error);
		}
	},
	getGasEstimateForTransaction({
		txArgs,
		method,
	}: GasEstimateForTransactionParams): Promise<number> {
		return new Promise((resolve, reject) => {
			method(...txArgs)
				.then((estimate: Number) => {
					resolve(this.js?.network.useOvm ? Number(estimate) : normalizeGasLimit(Number(estimate)));
				})
				.catch((e: Error) => reject(e));
		});
	},
};

export type { Synth };
export default synthetix;
