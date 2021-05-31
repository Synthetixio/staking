import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { NotificationTemplate, userNotificationState } from 'store/ui';
import { isWalletConnectedState } from 'store/wallet';
import media from 'styles/media';

import { DESKTOP_SIDE_NAV_WIDTH, MOBILE_SIDE_NAV_WIDTH } from 'constants/ui';

import GovVotingProposal from './templates/GovVotingProposal';
import DebtLiquidationWarning from './templates/DebtLiquidationWarning';

const UserNotifications: FC = () => {
	const userNotification = useRecoilValue(userNotificationState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	if (isWalletConnected && userNotification != null) {
		let template;
		switch (userNotification.template) {
			case NotificationTemplate.ELECTION: {
				template = <GovVotingProposal {...userNotification} />;
				break;
			}
			case NotificationTemplate.LIQUIDATION: {
				template = <DebtLiquidationWarning {...userNotification} />;
				break;
			}
		}

		return <Container>{template}</Container>;
	}

	return null;
};

const Container = styled.div`
	position: absolute;
	top: 24px;
	left: calc(${MOBILE_SIDE_NAV_WIDTH + 30}px);

	${media.greaterThan('mdUp')`
		left: calc(${DESKTOP_SIDE_NAV_WIDTH + 30}px);
	`}
`;

export default UserNotifications;
