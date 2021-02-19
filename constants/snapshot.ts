import BigNumber from 'bignumber.js';
import snapshot from '@snapshot-labs/snapshot.js';

export enum SPACE_KEY {
	COUNCIL = 'synthetixcouncil',
	PROPOSAL = 'synthetixproposal',
	GRANTS = 'synthetixgrants',
}

const BASE_URL = (testnet?: boolean) => (testnet ? `testnet` : `hub`);

export const SPACE = (spaceKey: string, testnet?: boolean) =>
	`https://${BASE_URL(testnet)}.snapshot.page/api/spaces/${spaceKey}`;
export const PROPOSALS = (spaceKey: string, testnet?: boolean) =>
	`https://${BASE_URL(testnet)}.snapshot.page/api/${spaceKey}/proposals`;
export const PROPOSAL = (spaceKey: string, ipfsHash: string, testnet?: boolean) =>
	`https://${BASE_URL(testnet)}.snapshot.page/api/${spaceKey}/proposal/${ipfsHash}`;
export const MESSAGE_URL = (testnet?: boolean) =>
	`https://${BASE_URL(testnet)}.snapshot.page/api/message`;

export const quadraticWeighting = (value: BigNumber) => {
	// Scale the value by 100000
	const scaledValue = value.multipliedBy(1e5);
	return scaledValue.sqrt();
};

// const gateways = [
// 	'cloudflare-ipfs.com',
// 	'cf-ipfs.com',
// 	'ipfs.io',
// 	'ipfs.fleek.co',
// 	'gateway.pinata.cloud',
// 	'dweb.link',
// 	'ipfs.infura.io',
// ];

export async function ipfsGet(ipfsHash: string, protocolType: string = 'ipfs') {
	const url = `https://cloudflare-ipfs.com/${protocolType}/${ipfsHash}`;
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
	return new Promise((resolove, reject) => {
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
				resolove(_3BoxProfiles);
			})
			.catch((error: any) => {
				reject(error);
			});
	});
}

function lookupAddresses(addresses: any[]) {
	return new Promise((resolove, reject) => {
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
							first: 1,
						},
						name: true,
						labelName: true,
					},
				},
			})
			.then(({ accounts }: { accounts: any }) => {
				const ensNames = {} as any;
				accounts.forEach(
					(profile: {
						id: string;
						registrations: any;
						domain: { name: any; labelName: any }[];
					}) => {
						ensNames[profile.id.toLowerCase()] =
							(profile?.registrations?.[0]?.domain?.labelName &&
								profile?.registrations?.[0]?.domain?.name) ||
							'';
					}
				);
				resolove(ensNames);
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
