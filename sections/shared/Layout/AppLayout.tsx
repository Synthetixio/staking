import { FC, ReactNode, useEffect, useState } from 'react';
import router from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { DESKTOP_SIDE_NAV_WIDTH, DESKTOP_BODY_PADDING } from 'constants/ui';
import ROUTES from 'constants/routes';
import NotificationContainer from 'constants/NotificationContainer';
import { SPACE_KEY } from 'constants/snapshot';
import UIContainer from 'containers/UI';
import useProposals from 'queries/gov/useProposals';
import { NotificationTemplate, userNotificationState } from 'store/ui';
import media from 'styles/media';
import { Proposal } from 'queries/gov/types';
import { isL2State, isMainnetState } from 'store/wallet';

import Header from './Header';
import SideNav from './SideNav';
import UserNotifications from './UserNotifications';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const isL2 = useRecoilValue(isL2State);
	const isMainnet = useRecoilValue(isMainnetState);
	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
	const setNotificationState = useSetRecoilState(userNotificationState);
	const { showMobileSideNav, closeMobileSideNav } = UIContainer.useContainer();

	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);

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

	const onTouchStart = (e: any) => {
		setTouchStart(e.targetTouches[0].clientX);
	};

	const onTouchMove = (e: any) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};

	const onTouchEnd = () => {
		if (touchStart - touchEnd > 150) {
			// left swipe
			closeMobileSideNav();
		}

		if (touchStart - touchEnd < -150) {
			// right swipe
			showMobileSideNav();
		}
	};

	return (
		<div
			{...{
				onTouchStart,
				onTouchMove,
				onTouchEnd,
			}}
		>
			<SideNav />
			<Header />
			<Content>{children}</Content>
			<NotificationContainer />
			{!isL2 && <UserNotifications />}
		</div>
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
