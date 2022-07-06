import {
	NetworkId,
	NetworkIdByName,
	NetworkName,
	NetworkNameById,
} from 'store/wallet/networkState';

export const ERRORS = {
	badNetworkArg:
		'unsupported network or network id passed. Please check SynthetixJS.supportedNetworks for a list of supported networks and ids',
	noMatch: (type: string, value: string): string => `no contracts match ${type}: ${value}`,
};

export const selectNetwork = (
	networkId?: NetworkId,
	network?: NetworkName
): [NetworkName, NetworkId, boolean] => {
	if (network && network in NetworkIdByName) {
		return [network, NetworkIdByName[network], network.includes('-ovm')];
	}

	if (networkId && networkId in NetworkNameById) {
		return [NetworkNameById[networkId], networkId, NetworkNameById[networkId].includes('-ovm')];
	}
	throw new Error(ERRORS.badNetworkArg);
};
