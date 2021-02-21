import { abi } from './erc20';

export default {
	address: (network) =>
		({
			mainnet: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
			kovan: '0x9B2fE385cEDea62D839E4dE89B0A23EF4eacC717',
		}[network]),
	abi,
};
