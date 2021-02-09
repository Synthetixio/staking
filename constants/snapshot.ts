import BigNumber from 'bignumber.js';

// @TODO: change back to council end point
export enum SPACE_KEY {
	COUNCIL = 'ilv.eth',
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
export const MSG = (testnet?: boolean) => `https://${BASE_URL(testnet)}.snapshot.page/api/message`;

export const quadraticWeighting = (value: BigNumber) => {
	// Scale the value by 100000
	const scaledValue = value.multipliedBy(1e5);
	return scaledValue.sqrt();
};
