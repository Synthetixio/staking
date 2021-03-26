export enum Action {
	APPROVE_ALL = 'ApproveAll',
	ISSUE_FOR_ADDRESS = 'IssueForAddress',
	BURN_FOR_ADDRESS = 'BurnForAddress',
	CLAIM_FOR_ADDRESS = 'ClaimForAddress',
	EXCHANGE_FOR_ADDRESS = 'ExchangeForAddress',
}

export const APPROVE_CONTRACT_METHODS: Map<string, string> = new Map([
	[Action.APPROVE_ALL, 'approveAllDelegatePowers'],
	[Action.ISSUE_FOR_ADDRESS, 'approveIssueOnBehalf'],
	[Action.BURN_FOR_ADDRESS, 'approveBurnOnBehalf'],
	[Action.CLAIM_FOR_ADDRESS, 'approveClaimOnBehalf'],
	[Action.EXCHANGE_FOR_ADDRESS, 'approveExchangeOnBehalf'],
]);

export const WITHDRAW_CONTRACT_METHODS: Map<string, string> = new Map([
	[Action.APPROVE_ALL, 'removeAllDelegatePowers'],
	[Action.ISSUE_FOR_ADDRESS, 'removeIssueOnBehalf'],
	[Action.BURN_FOR_ADDRESS, 'removeBurnOnBehalf'],
	[Action.CLAIM_FOR_ADDRESS, 'removeClaimOnBehalf'],
	[Action.EXCHANGE_FOR_ADDRESS, 'removeExchangeOnBehalf'],
]);

export const ENTITY_ATTRS: Map<string, string> = new Map([
	[Action.APPROVE_ALL, 'all'],
	[Action.ISSUE_FOR_ADDRESS, 'mint'],
	[Action.BURN_FOR_ADDRESS, 'burn'],
	[Action.CLAIM_FOR_ADDRESS, 'claim'],
	[Action.EXCHANGE_FOR_ADDRESS, 'exchange'],
]);

export const ACTIONS: string[] = Object.values(Action);

export class Account {
	authoriser: string;
	delegate: string;
	mint: boolean;
	burn: boolean;
	claim: boolean;
	exchange: boolean;

	constructor(
		authoriser: string,
		delegate: string,
		mint: boolean,
		burn: boolean,
		claim: boolean,
		exchange: boolean
	) {
		this.authoriser = authoriser;
		this.delegate = delegate;
		this.mint = mint;
		this.burn = burn;
		this.claim = claim;
		this.exchange = exchange;
	}

	get all(): boolean {
		return this.mint && this.burn && this.claim && this.exchange;
	}
}
