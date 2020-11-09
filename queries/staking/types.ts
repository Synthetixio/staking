export type FeePoolData = {
	feePeriodDuration: number;
	startTime: number;
	feesToDistribute: number;
	feesClaimed: number;
	rewardsToDistribute: number;
	rewardsClaimed: number;
};

export type FeeClaimedHistory = {
	feesClaimedHistory: History[];
};

export type History = {
	account: string;
	block: number;
	hash: string;
	rewards: number;
	timestamp: number;
	type: string;
	value: number;
};
