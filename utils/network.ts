import detectEthereumProvider from '@metamask/detect-provider';

import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkId } from '@synthetixio/contracts-interface';
import { GWEI_UNIT, GasLimitEstimate } from 'constants/network';

type EthereumProvider = {
	isMetaMask: boolean;
	chainId: string;
};

export async function getDefaultNetworkId(): Promise<NetworkId> {
	try {
		const provider = (await detectEthereumProvider()) as EthereumProvider;
		if (provider && provider.chainId) {
			return Number(provider.chainId);
		}
		return DEFAULT_NETWORK_ID;
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

export const matchesNetworkErrorString = (error: string) =>
	error.includes('unsupported network or network id passed');

export const networkErrorMessage = 'Wrong network detected';
