export enum SPACE_KEY {
	COUNCIL = 'spartancouncil.eth',
	PROPOSAL = 'snxgov.eth',
	GRANTS = 'snxgrants.eth',
	AMBASSADOR = 'snxambassador.eth',
}

// @TODO toggle flag for testnet or live snapshot spaces
const isTestNet = true;

const BASE_URL = () => (isTestNet ? `testnet` : `hub`);

export const SPACE = (spaceKey: string) =>
	`https://${BASE_URL()}.snapshot.page/api/spaces/${spaceKey}`;

export const PROPOSALS = (spaceKey: string) =>
	`https://${BASE_URL()}.snapshot.page/api/${spaceKey}/proposals`;

export const PROPOSAL = (spaceKey: string, ipfsHash: string) =>
	`https://${BASE_URL()}.snapshot.page/api/${spaceKey}/proposal/${ipfsHash}`;

export const MESSAGE_URL = `https://${BASE_URL()}.snapshot.page/api/message`;
