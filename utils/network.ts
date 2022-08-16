import { detectEthereumProvider } from './metamask-detect-provider';
import { DEFAULT_GAS_BUFFER, DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkId, NetworkNameById } from '@synthetixio/contracts-interface';

import { GasLimitEstimate } from 'constants/network';
import Wei, { wei } from '@synthetixio/wei';
import { GWEI_DECIMALS, GWEI_UNIT } from './infura';
import { GasPrice } from '@synthetixio/queries';

export function isSupportedNetworkId(id: number | string): id is NetworkId {
  return id in NetworkNameById;
}

export async function getDefaultNetworkId(): Promise<NetworkId> {
  try {
    const provider = await detectEthereumProvider();
    const id = Number(provider?.chainId || 0);
    return isSupportedNetworkId(id) ? id : DEFAULT_NETWORK_ID;
  } catch (e) {
    console.log(e);
    return DEFAULT_NETWORK_ID;
  }
}

export async function isCurrentNetworkSupported(): Promise<boolean> {
  try {
    const provider = await detectEthereumProvider();
    const id = Number(provider?.chainId || 0);
    return isSupportedNetworkId(id);
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const getTotalGasPrice = (gasPriceObj?: GasPrice | null) => {
  if (!gasPriceObj) return wei(0);
  const { gasPrice, baseFeePerGas, maxPriorityFeePerGas } = gasPriceObj;
  if (gasPrice) {
    return wei(gasPrice, GWEI_DECIMALS);
  }
  return wei(baseFeePerGas || 0, GWEI_DECIMALS).add(wei(maxPriorityFeePerGas || 0, GWEI_DECIMALS));
};

export const getTransactionPrice = (
  gasPrice: GasPrice | null,
  gasLimit: GasLimitEstimate,
  ethPrice: Wei | null,
  optimismLayerOneFee: Wei | null
) => {
  if (!gasPrice || !gasLimit || !ethPrice) return null;
  const totalGasPrice = getTotalGasPrice(gasPrice);

  const extraLayer1Fees = optimismLayerOneFee;
  const gasPriceCost = totalGasPrice.mul(wei(gasLimit, GWEI_DECIMALS)).mul(ethPrice);
  const l1Cost = ethPrice.mul(extraLayer1Fees || 0);

  const txPrice = gasPriceCost.add(l1Cost);

  return txPrice;
};

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER;

export const normalizedGasPrice = (gasPrice: number) => gasPrice * GWEI_UNIT;

export const getIsOVM = (networkId: number): boolean => !!~[10, 69, 420].indexOf(networkId);
export const matchesNetworkErrorString = (error: string) =>
  error.includes('unsupported network or network id passed');

export const networkErrorMessage = 'Wrong network detected';
