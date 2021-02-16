import { atom } from 'recoil';

import { getGovKey } from '../utils';

import { Proposal } from 'queries/gov/types';

export enum ProposalInfoType {
	RESULTS = 'results',
	HISTORY = 'history',
}

export enum PanelType {
	LIST = 'list',
	PROPOSAL = 'proposal',
	CREATE = 'create',
}

export const proposalState = atom<Proposal | null>({
	key: getGovKey('proposal'),
	default: null,
});

export const panelState = atom<PanelType>({
	key: getGovKey('panel'),
	default: PanelType.LIST,
});
