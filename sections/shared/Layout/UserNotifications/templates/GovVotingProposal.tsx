import Notification from 'components/Notification';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { UserNotification } from 'store/ui';

import { Heading, Message } from './common';

const GovVotingProposal: FC<UserNotification> = ({ type, props, template }) => {
	const { t } = useTranslation();

	return (
		// TODO: replace with correct link to proposal voting
		<Notification type={type} link={`/gov/${props.proposal}`}>
			<Heading>{t(`notifications.${template}.heading`)}</Heading>
			<Message>{t(`notifications.${template}.message`, { proposal: props.proposal })}</Message>
		</Notification>
	);
};

export default GovVotingProposal;
