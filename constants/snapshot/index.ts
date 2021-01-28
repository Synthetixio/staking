import BigNumber from 'bignumber.js';

export const COUNCIL_SPACE = 'https://hub.snapshot.page/api/spaces/synthetixcouncil';
export const PROPOSAL_SPACE = 'https://hub.snapshot.page/api/spaces/synthetixproposal';
export const COUNCIL_PROPOSALS = 'https://hub.snapshot.page/api/synthetixcouncil/proposals';
export const PROPOSAL_PROPOSALS = 'https://hub.snapshot.page/api/synthetixproposal/proposals';
export const COUNCIL_INDIVIDUAL_PROPOSAL = (ipfsHash: string) =>
	`https://hub.snapshot.page/api/synthetixcouncil/proposal/${ipfsHash}`;
export const PROPOSAL_INDIVIDUAL_PROPOSAL = (ipfsHash: string) =>
	`https://hub.snapshot.page/api/synthetixproposal/proposal/${ipfsHash}`;

export const quadraticWeighting = (value: BigNumber) => {
	// Scale the value by 100000
	const scaledValue = value.multipliedBy(1e5);
	return scaledValue.sqrt();
};
