import { SIDE_NAV_WIDTH } from 'constants/ui';
import { FC, ReactNode, useEffect } from 'react';
import router from 'next/router';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { networkState } from 'store/wallet';

import Header from './Header';
import SideNav from './SideNav';
import NotificationContainer from 'constants/NotificationContainer';
import UserNotifications from './UserNotifications';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const network = useRecoilValue(networkState);
	const isL1 = !network?.useOvm ?? null;

	useEffect(() => {
		if (isL1 && router.pathname === ROUTES.Withdraw.Home) {
			router.push(ROUTES.Home);
		}
		if (!isL1 && router.pathname === ROUTES.L2.Deposit) {
			router.push(ROUTES.Home);
		}
	}, [isL1]);

	return (
		<>
			<SideNav />
			<Header />
			<Content>{children}</Content>
			<NotificationContainer />
			{!!isL1 && <UserNotifications />}
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
