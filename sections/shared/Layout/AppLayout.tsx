import { DESKTOP_SIDE_NAV_WIDTH, DESKTOP_BODY_PADDING } from 'constants/ui';
import { FC, ReactNode, useEffect } from 'react';
import router from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import NotificationContainer from 'constants/NotificationContainer';
import { SPACE_KEY } from 'constants/snapshot';
import useProposals from 'queries/gov/useProposals';
import { NotificationTemplate, userNotificationState } from 'store/ui';
import { isL2State } from 'store/wallet';
import media from 'styles/media';
import { Proposal } from 'queries/gov/types';

import Header from './Header';
import SideNav from './SideNav';
import UserNotifications from './UserNotifications';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const isL2 = useRecoilValue(isL2State);
	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
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
	}, [isL2]);

	useEffect(() => {
		if (councilProposals.data && !isL2) {
			let latestProposal = {
				msg: {
					payload: {
						snapshot: '0',
					},
				},
			} as Partial<Proposal>;

			councilProposals.data.forEach((proposal) => {
				if (
					parseInt(proposal.msg.payload.snapshot) >
					parseInt(latestProposal?.msg?.payload.snapshot ?? '0')
				) {
					latestProposal = proposal;
				}
			});

			if (new Date().getTime() / 1000 < (latestProposal?.msg?.payload.end ?? 0)) {
				setNotificationState({
					type: 'info',
					template: NotificationTemplate.ELECTION,
					props: {
						proposal: latestProposal?.msg?.payload.name,
						link: `${latestProposal.msg?.space}/${latestProposal.authorIpfsHash}`,
					},
				});
			}
		}
	}, [councilProposals, setNotificationState, isL2]);

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
