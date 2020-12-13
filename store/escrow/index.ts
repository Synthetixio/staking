import { atom } from 'recoil';

import { getEscrowKey } from '../utils';

export enum EscrowPanelType {
	STAKING = 'staking',
	ICO = 'ico',
}

export const panelTypeState = atom<EscrowPanelType>({
	key: getEscrowKey('panelType'),
	default: EscrowPanelType.STAKING,
});
