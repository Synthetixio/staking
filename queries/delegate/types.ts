export enum Action {
	APPROVE_ALL = 'ApproveAll',
	BURN_FOR_ADDRESS = 'BurnForAddress',
	ISSUE_FOR_ADDRESS = 'IssueForAddress',
	CLAIM_FOR_ADDRESS = 'ClaimForAddress',
	EXCHANGE_FOR_ADDRESS = 'ExchangeForAddress',
}

export const APPROVE_CONTRACT_METHODS: Map<string, string> = new Map([
	[Action.APPROVE_ALL, 'approveAllDelegatePowers'],
	[Action.BURN_FOR_ADDRESS, 'approveBurnOnBehalf'],
	[Action.ISSUE_FOR_ADDRESS, 'approveIssueOnBehalf'],
	[Action.CLAIM_FOR_ADDRESS, 'approveClaimOnBehalf'],
	[Action.EXCHANGE_FOR_ADDRESS, 'approveExchangeOnBehalf'],
]);

export const WITHDRAW_CONTRACT_METHODS: Map<string, string> = new Map([
	[Action.APPROVE_ALL, 'removeAllDelegatePowers'],
	[Action.BURN_FOR_ADDRESS, 'removeBurnOnBehalf'],
	[Action.ISSUE_FOR_ADDRESS, 'removeIssueOnBehalf'],
	[Action.CLAIM_FOR_ADDRESS, 'removeClaimOnBehalf'],
	[Action.EXCHANGE_FOR_ADDRESS, 'removeExchangeOnBehalf'],
]);

export const ACTIONS: string[] = Object.values(Action);

export type DelegateApproval = {
	authoriser: string;
	delegate: string;
	action: string;
};
