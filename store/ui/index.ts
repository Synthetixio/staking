import { atom } from 'recoil';

import { getUIKey } from '../utils';

export const hasOrdersNotificationState = atom<boolean>({
	key: getUIKey('hasOrderNotifications'),
	default: false,
});
