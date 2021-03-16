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
	strategies: SpaceStrategy[];
	symbol: string;
};

export type SpaceStrategy = {
	name: string;
	params: {
		address?: string;
		decimals: number;
		symbol: string;
	};
};

export type Proposal = {
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
	votes: number;
	route: Function;
};

export type IpfsProposal = {
	address: string;
	msg: {
		payload: {
			body: string;
			choices: string[];
			end: number;
			metadata: {
				stratgies: SpaceStrategy[];
			};
			name: string;
			snapshot: string;
			start: number;
		};
		space: string;
		timestamp: string;
		type: string;
		version: string;
	};
	sig: string;
	version: string;
};

export type Votes = {
	voterAddresses: string[];
	voterSignatures: Vote[];
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
