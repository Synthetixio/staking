import BigNumber from 'bignumber.js';
import snapshot from '@snapshot-labs/snapshot.js';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';

export const quadraticWeighting = (value: BigNumber) => {
	// @notice Scale the value by 100000
	const scaledValue = value.multipliedBy(1e5);
	return scaledValue.sqrt();
};

export async function ipfsGet(ipfsHash: string) {
	const url = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
	return fetch(url).then((res) => res.json());
}

export function jsonParse(input: any, fallback?: any) {
	if (typeof input !== 'string') {
		return fallback || {};
	}
	try {
		return JSON.parse(input);
	} catch (err) {
		return fallback || {};
	}
}

export function formatProposal(proposal: any) {
	proposal.msg = jsonParse(proposal.msg, proposal.msg);

	// v0.1.0
	if (proposal.msg.version === '0.1.0') {
		proposal.msg.payload.start = 1595088000;
		proposal.msg.payload.end = 1595174400;
		proposal.msg.payload.snapshot = 10484400;
		proposal.bpt_voting_disabled = '1';
	}

	// v0.1.1
	if (proposal.msg.version === '0.1.0' || proposal.msg.version === '0.1.1') {
		proposal.msg.payload.metadata = {};
	}

	return proposal;
}

function get3BoxProfiles(addresses: any) {
	return new Promise((resolve, reject) => {
		snapshot.utils
			.subgraphRequest('https://api.3box.io/graph', {
				profiles: {
					__args: {
						ids: addresses,
					},
					name: true,
					eth_address: true,
					image: true,
				},
			})
			.then(({ profiles }: { profiles: any }) => {
				const _3BoxProfiles = {} as any;
				profiles.forEach((profile: { eth_address: string }) => {
					_3BoxProfiles[profile.eth_address.toLowerCase()] = profile;
				});
				resolve(_3BoxProfiles);
			})
			.catch((error: any) => {
				reject(error);
			});
	});
}

export function lookupAddresses(addresses: any[]) {
	return new Promise((resolve, reject) => {
		snapshot.utils
			.subgraphRequest('https://api.thegraph.com/subgraphs/name/ensdomains/ens', {
				accounts: {
					__args: {
						first: 1000,
						where: {
							id_in: addresses.map((addresses: string) => addresses.toLowerCase()),
						},
					},
					id: true,
					domains: {
						__args: {
							first: 2,
						},
						name: true,
						labelName: true,
					},
				},
			})
			.then(({ accounts }: { accounts: any }) => {
				const ensNames = {} as any;
				accounts.forEach((profile: any) => {
					ensNames[profile.id.toLowerCase()] = profile.domains[0].name ?? null;
				});
				resolve(ensNames);
			})
			.catch((error: any) => {
				reject(error);
			});
	});
}

export async function getProfiles(addresses: any) {
	let ensNames: any = {};
	let _3BoxProfiles: any = {};
	try {
		[ensNames, _3BoxProfiles] = await Promise.all([
			lookupAddresses(addresses),
			get3BoxProfiles(addresses),
		]);
	} catch (e) {
		console.log(e);
	}

	const profiles = Object.fromEntries(addresses.map((address: any) => [address, {}]));
	return Object.fromEntries(
		Object.entries(profiles).map(([address, profile]) => {
			profile = _3BoxProfiles[address.toLowerCase()] || {};
			profile.ens = ensNames[address.toLowerCase()] || '';
			return [address, profile];
		})
	);
}

export const expired = (end?: number) => {
	if (!end) return true;
	if (getCurrentTimestampSeconds() > end) {
		return true;
	} else {
		return false;
	}
};

export const pending = (start?: number) => {
	if (!start) return true;
	if (getCurrentTimestampSeconds() < start) {
		return true;
	} else {
		return false;
	}
};
