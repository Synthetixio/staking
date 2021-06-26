export type SpaceData = {
	domain: string;
	filters: {
		onlyMembers: boolean;
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
	id: string;
	author: string;
	created: number;
	space: SpaceData;
	network: string;
	strategies: SpaceStrategy;
	plugins: any;
	title: string;
	body: string;
	choices: string[];
	start: number;
	end: number;
	snapshot: string;
	state: string;
};

export type Vote = {
	id: string;
	voter: string;
	created: number;
	space: SpaceData;
	proposal: string;
	choice: any;
	metadata: any;
};

export type ProposalResults = {
	totalBalances: number[];
	totalScores: any;
	totalVotes: number[];
	totalVotesBalances: number;
	choices: string[];
	spaceSymbol: string;
	voteList: any[];
};
