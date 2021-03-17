import detectEthereumProvider from '@metamask/detect-provider';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkId } from '@synthetixio/contracts-interface';
import { GWEI_UNIT, GasLimitEstimate } from 'constants/network';

type EthereumProvider = {
	isMetaMask: boolean;
	networkVersion: string;
};

export async function getDefaultNetworkId(): Promise<NetworkId> {
	try {
		const provider = (await detectEthereumProvider()) as EthereumProvider;

		return provider ? Number(provider.networkVersion) : DEFAULT_NETWORK_ID;
	} catch (e) {
		console.log(e);
		return DEFAULT_NETWORK_ID;
	}
}

export const getTransactionPrice = (
	gasPrice: number | null,
	gasLimit: GasLimitEstimate,
	ethPrice: number | null
) => {
	if (!gasPrice || !gasLimit || !ethPrice) return null;

	return (gasPrice * ethPrice * gasLimit) / GWEI_UNIT;
};

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER;

export const normalizedGasPrice = (gasPrice: number) => gasPrice * GWEI_UNIT;
