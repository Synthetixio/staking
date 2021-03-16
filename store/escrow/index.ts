import { atom } from 'recoil';

import { getEscrowKey } from '../utils';

export enum EscrowPanelType {
	REWARDS = 'rewards',
	ICO = 'ico',
}

export const panelTypeState = atom<EscrowPanelType>({
	key: getEscrowKey('panelType'),
	default: EscrowPanelType.REWARDS,
});
