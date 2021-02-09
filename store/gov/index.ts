import { atom } from 'recoil';

import { getGovKey } from '../utils';

import { Proposal } from 'queries/gov/types';

export enum ProposalInfoType {
	RESULTS = 'results',
	HISTORY = 'history',
}

export const proposalState = atom<Proposal | null>({
	key: getGovKey('proposal'),
	default: null,
});
