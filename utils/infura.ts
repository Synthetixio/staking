import { Network } from 'store/wallet';

export const GWEI_DECIMALS = 9;

export const GWEI_UNIT = 1000000000;

export const getInfuraRpcURL = (network?: Network) =>
	`https://${network ? network.name : `mainnet`}.infura.io/v3/${
		process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
	}`;
