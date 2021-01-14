import { SIDE_NAV_WIDTH } from 'constants/ui';
import { FC, useEffect, ReactNode } from 'react';
import router from 'next/router';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import useEscrowDataQuery from 'hooks/useEscrowDataQueryWrapper';

import Header from './Header';
import SideNav from './SideNav';

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
	const rewardEscrowQuery = useEscrowDataQuery();
	const totalBalancePendingMigration = rewardEscrowQuery?.data?.totalBalancePendingMigration ?? 0;

	useEffect(() => {
		if (
			totalBalancePendingMigration > 0 &&
			router.pathname !== ROUTES.Home &&
			router.pathname !== ROUTES.Escrow.Home
		) {
			router.push(ROUTES.Escrow.Home);
		}
	}, [totalBalancePendingMigration]);

	return (
		<>
			<SideNav />
			<Header />
			<Content>{children}</Content>
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
