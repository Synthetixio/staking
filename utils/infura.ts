import { NetworkNameById, NetworkId } from '@synthetixio/contracts-interface';

export const GWEI_DECIMALS = 9;

export const GWEI_UNIT = 1000000000;
const SYNTHETIX_OVM_SUFFIX = '-ovm';
const INFURA_OWN_PREFIX = 'optimism-';

const getNetworkName = (networkId?: NetworkId) => {
  if (!networkId) return NetworkNameById[1];
  return networkId in NetworkNameById ? NetworkNameById[networkId] : NetworkNameById[1];
};

export const getInfuraRpcURL = (networkId?: NetworkId) => {
  const networkName = getNetworkName(networkId);
  const optimismPrefix = networkName.includes(SYNTHETIX_OVM_SUFFIX) ? INFURA_OWN_PREFIX : '';
  const url = `https://${
    optimismPrefix + networkName.replace(SYNTHETIX_OVM_SUFFIX, '')
  }.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`;
  return url;
};

export const getChainIdHex = (networkId: NetworkId) => {
  return `0x${networkId.toString(16)}`;
};

export const getNetworkIdFromHex = (chainId: string) => {
  return parseInt(chainId, 16);
};
