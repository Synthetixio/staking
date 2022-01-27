import { getNetworkFromId } from '@synthetixio/contracts-interface';

export const GWEI_DECIMALS = 9;

export const GWEI_UNIT = 1000000000;

export const getInfuraRpcURL = (networkId?: number) => {
	const network: { name: string; useOvm: boolean } | undefined = getNetworkFromId(networkId);
	const networkName = network ? network.name : `mainnet`;
	const optimismPrefix = network?.useOvm ? 'optimism-' : '';
	const url = `https://${optimismPrefix + networkName}.infura.io/v3/${
		process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
	}`;
	return url;
};
