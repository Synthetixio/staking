import { FC, ReactNode, useEffect } from 'react';
import router from 'next/router';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { DESKTOP_SIDE_NAV_WIDTH, DESKTOP_BODY_PADDING } from 'constants/ui';
import ROUTES from 'constants/routes';
import NotificationContainer from 'constants/NotificationContainer';

import media from 'styles/media';
import { isL2State, isMainnetState } from 'store/wallet';
import Header from './Header';
import SideNav from './SideNav';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const isL2 = useRecoilValue(isL2State);
	const isMainnet = useRecoilValue(isMainnetState);

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

	return (
		<>
			<SideNav />
			<Header />
			<Content>{children}</Content>
			<NotificationContainer />
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
