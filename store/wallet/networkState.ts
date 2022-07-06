import { atom } from 'recoil';
import { getWalletKey } from 'store/utils';

export type Network = {
	id: NetworkId;
	name: NetworkName;
	useOvm: boolean;
};

// TODO: update in monorepo
// Contracts interface includes synthetix in the same file with contstants so cannot use it

export const NetworkIdByName = {
	mainnet: 1,
	goerli: 5,
	'mainnet-ovm': 10,
	kovan: 42,
	'kovan-ovm': 69,
	'mainnet-fork': 31337,
} as const;

export const NetworkNameById = {
	1: 'mainnet',
	5: 'goerli',
	42: 'kovan',
	10: 'mainnet-ovm',
	69: 'kovan-ovm',
	31337: 'mainnet-fork',
} as const;

export type NetworkId = typeof NetworkIdByName[keyof typeof NetworkIdByName];
export type NetworkName = keyof typeof NetworkIdByName;

export const networkState = atom<Network | null>({
	key: getWalletKey('network'),
	default: { id: NetworkIdByName.mainnet, name: NetworkNameById[1], useOvm: false },
});
