import Notification from 'components/Notification';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { UserNotification } from 'store/ui';

import { Heading, Message } from './common';

const DebtLiquidationWarning: FC<UserNotification> = ({ type, template }) => {
	const { t } = useTranslation();

	return (
		<Notification type={type}>
			<Heading>{t(`notifications.${template}.heading`)}</Heading>
			<Message>{t(`notifications.${template}.message`)}</Message>
		</Notification>
	);
};

export default DebtLiquidationWarning;
