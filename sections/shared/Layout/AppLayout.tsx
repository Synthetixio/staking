import { SIDE_NAV_WIDTH } from 'constants/ui';
import { FC, ReactNode, useEffect } from 'react';
import router from 'next/router';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { isL2State } from 'store/wallet';

import Header from './Header';
import SideNav from './SideNav';
import NotificationContainer from 'constants/NotificationContainer';
import UserNotifications from './UserNotifications';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const isL2 = useRecoilValue(isL2State);

	useEffect(() => {
		if (!isL2 && router.pathname === ROUTES.Withdraw.Home) {
			router.push(ROUTES.Home);
		}
		if (isL2 && router.pathname === ROUTES.L2.Deposit) {
			router.push(ROUTES.Home);
		}
	}, [isL2]);

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
	padding-right: 40px;
	padding-left: calc(${SIDE_NAV_WIDTH} + 40px);
`;

export default AppLayout;
