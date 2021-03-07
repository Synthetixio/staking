import { atom } from 'recoil';

import { NotificationType } from 'components/Notification/types';
import localStore from 'utils/localStore';

import { userNotificationKey } from './constants';

export type UserNotification = {
	type: NotificationType;
	template: 'gov-voting-proposal' | 'debt-liquidation-warning';
	props?: any;
};

export const userNotificationState = atom<UserNotification | null>({
	key: userNotificationKey,
	default: localStore.get(userNotificationKey),
});
