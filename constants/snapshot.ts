export enum SPACE_KEY {
	COUNCIL = 'spartancouncil.eth',
	TREASURY = 'treasurycouncil.eth',
	PROPOSAL = 'snxgov.eth',
	GRANTS = 'snxgrants.eth',
	AMBASSADOR = 'snxambassador.eth',
}

const isTestNet = false;

const BASE_URL = isTestNet ? `testnet` : `hub`;

export const snapshotEndpoint = `https://${BASE_URL}.snapshot.org/graphql`;

export const MESSAGE_URL = `https://${BASE_URL}.snapshot.org/api/message`;
