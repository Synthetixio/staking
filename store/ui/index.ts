import { atom } from 'recoil';

import { NotificationType } from 'components/Notification/types';
import localStore from 'utils/localStore';

import { userNotificationKey } from './constants';

export enum NotificationTemplate {
	ELECTION = 'gov-voting-election',
	LIQUIDATION = 'debt-liquidation-warning',
}

export type UserNotification = {
	type: NotificationType;
	template: NotificationTemplate;
	props?: any;
};

export const userNotificationState = atom<UserNotification | null>({
	key: userNotificationKey,
	default: localStore.get(userNotificationKey),
});
