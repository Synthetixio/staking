import BigNumber from 'bignumber.js';

export enum SPACE_KEY {
	COUNCIL = 'synthetixcouncil',
	PROPOSAL = 'synthetixproposal',
	GRANTS = 'synthetixgrants',
}

export const SPACE = (spaceKey: string) => `https://hub.snapshot.page/api/spaces/${spaceKey}`;
export const PROPOSALS = (spaceKey: string) =>
	`https://hub.snapshot.page/api/${spaceKey}/proposals`;
export const PROPOSAL = (spaceKey: string, ipfsHash: string) =>
	`https://hub.snapshot.page/api/${spaceKey}/proposal/${ipfsHash}`;

export const quadraticWeighting = (value: BigNumber) => {
	// Scale the value by 100000
	const scaledValue = value.multipliedBy(1e5);
	return scaledValue.sqrt();
};
