import { atom } from 'recoil';

import { getUIKey } from '../utils';
import { CHAINS_MAP } from 'constants/network';

export const hasOrdersNotificationState = atom<boolean>({
	key: getUIKey('hasOrderNotifications'),
	default: false,
});

export const currentLayerChainState = atom<string>({
	key: getUIKey('currentLayerChain'),
	default: CHAINS_MAP.L1,
});
