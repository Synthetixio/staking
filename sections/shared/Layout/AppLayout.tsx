import { FC, ReactNode, useEffect } from 'react';
import router from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { DESKTOP_SIDE_NAV_WIDTH, DESKTOP_BODY_PADDING } from 'constants/ui';
import ROUTES from 'constants/routes';
import NotificationContainer from 'constants/NotificationContainer';
import { NotificationTemplate, userNotificationState } from 'store/ui';
import media from 'styles/media';
import { isL2State, isMainnetState } from 'store/wallet';
import useLatestCouncilElectionQuery from 'queries/gov/useLatestCouncilElectionQuery';

import Header from './Header';
import SideNav from './SideNav';
import UserNotifications from './UserNotifications';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const isL2 = useRecoilValue(isL2State);
	const isMainnet = useRecoilValue(isMainnetState);
	const latestCouncilElection = useLatestCouncilElectionQuery();
	const setNotificationState = useSetRecoilState(userNotificationState);

	useEffect(() => {
		if (!isL2 && router.pathname === ROUTES.Withdraw.Home) {
			router.push(ROUTES.Home);
		}
		if (isL2 && router.pathname === ROUTES.L2.Deposit) {
			router.push(ROUTES.Home);
		}
		if (isL2 && router.pathname.includes(ROUTES.Gov.Home)) {
			router.push(ROUTES.Home);
		}
		if (!isMainnet && router.pathname.includes(ROUTES.Debt.Home)) {
			router.push(ROUTES.Home);
		}
	}, [isL2, isMainnet]);

	useEffect(() => {
		if (latestCouncilElection.data && !isL2) {
			let latestProposal = latestCouncilElection.data;
			if (new Date().getTime() / 1000 < (latestProposal.end ?? 0)) {
				setNotificationState({
					type: 'info',
					template: NotificationTemplate.ELECTION,
					props: {
						proposal: latestProposal.title,
						link: `${latestProposal.space}/${latestProposal.id}`,
					},
				});
			}
		}
	}, [latestCouncilElection, setNotificationState, isL2]);

	return (
		<>
			<SideNav />
			<Header />
			<Content>{children}</Content>
			<NotificationContainer />
			{!isL2 && <UserNotifications />}
		</>
	);
};

const Content = styled.div`
	max-width: 1200px;
	margin: 0 auto;

	${media.greaterThan('mdUp')`
		padding-left: calc(${DESKTOP_SIDE_NAV_WIDTH + DESKTOP_BODY_PADDING}px);
	`}
`;

export default AppLayout;
