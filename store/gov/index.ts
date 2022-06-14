import { atom } from 'recoil';

import { getGovKey } from '../utils';

import { Proposal } from '@synthetixio/queries';

export enum ProposalInfoType {
	RESULTS = 'results',
	HISTORY = 'history',
}

export enum PanelType {
	LIST = 'list',
	PROPOSAL = 'proposal',
	CREATE = 'create',
}
export const panelState = atom<PanelType>({
	key: getGovKey('panel'),
	default: PanelType.LIST,
});
