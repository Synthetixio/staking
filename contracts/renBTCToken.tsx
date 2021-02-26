import { ethers } from 'ethers';
import { abi } from './erc20';

export const ABI = abi;

export const ADDRESSES: Record<string, string> = {
	mainnet: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
	kovan: '0x9B2fE385cEDea62D839E4dE89B0A23EF4eacC717',
};

export function makeContract(
	network: string,
	signer: ethers.Signer | ethers.providers.Provider
): ethers.Contract {
	const address = ADDRESSES[network];
	return new ethers.Contract(address, ABI, signer);
}
