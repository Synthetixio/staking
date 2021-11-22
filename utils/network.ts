import { detectEthereumProvider } from './metamask-detect-provider';
import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkId } from '@synthetixio/contracts-interface';
import { GasLimitEstimate } from 'constants/network';
import Wei from '@synthetixio/wei';
import { GWEI_UNIT } from './infura';

export async function getDefaultNetworkId(): Promise<NetworkId> {
	try {
		const provider = await detectEthereumProvider();
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
	gasPrice: Wei | null,
	gasLimit: GasLimitEstimate,
	ethPrice: Wei | null
) => {
	if (!gasPrice || !gasLimit || !ethPrice) return null;

	return gasPrice.mul(ethPrice).mul(gasLimit).div(GWEI_UNIT);
};

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER;

export const normalizedGasPrice = (gasPrice: number) => gasPrice * GWEI_UNIT;

export const getIsOVM = (networkId: number): boolean => !!~[10, 69].indexOf(networkId);
export const matchesNetworkErrorString = (error: string) =>
	error.includes('unsupported network or network id passed');

export const networkErrorMessage = 'Wrong network detected';
