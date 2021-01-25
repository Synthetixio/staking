export enum SPACES {
	COUNCIL = 'council',
	PROPOSAL = 'proposal',
}

export type SpaceStrategy = {
	name: string;
	params: {
		address: string;
		decimals: number;
		symbol: string;
	};
};

export type SpaceData = {
	domain: string;
	filters: {
		defaultTab: string;
		invalids: string[];
		minScore: number;
	};
	members: string[];
	name: string;
	network: string;
	skin: string;
	stratgies: SpaceStrategy[];
	symbol: string;
};

export type Proposal = {
	proposalHash: string;
	address: string;
	msg: {
		version: string;
		timestamp: string;
		space: string;
		type: string;
		payload: {
			end: number;
			body: string;
			name: string;
			start: number;
			choices: string[];
			metadata: {
				stratgies: SpaceStrategy[];
			};
			snapshot: string;
		};
	};
	sig: string;
	authorIpfsHash: string;
	relayerIpfsHash: string;
	filteredVoters: Vote[];
};

export type Vote = {
	address: string;
	authorIpfsHash: string;
	msg: {
		payload: {
			choice: number;
			metadata: {};
			proposal: string;
		};
		space: string;
		timestamp: string;
		type: string;
		version: string;
	};
	relayerIpfsHash: string;
	sig: string;
};
