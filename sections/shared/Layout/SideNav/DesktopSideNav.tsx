import styled from 'styled-components';
import { FC, useMemo } from 'react';
import Link from 'next/link';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import StakingLogo from 'assets/svg/app/staking-logo.svg';
import StakingL2Logo from 'assets/svg/app/staking-l2-logo.svg';

import useCryptoBalances from 'hooks/useCryptoBalances';

import ROUTES from 'constants/routes';
import { CryptoCurrency, Synths } from 'constants/currency';
import { DESKTOP_SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import UIContainer from 'containers/UI';

import { isL2State, walletAddressState, delegateWalletState } from 'store/wallet';

import PriceItem from 'sections/shared/Layout/Stats/PriceItem';
import PeriodBarStats from 'sections/shared/Layout/Stats/PeriodBarStats';
import BalanceItem from 'sections/shared/Layout/Stats/BalanceItem';
import CRatioBarStats from 'sections/shared/Layout/Stats/CRatioBarStats';

import SideNav from './SideNav';
import SubMenu from './DesktopSubMenu';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

const DesktopSideNav: FC = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);

	const { useSynthsBalancesQuery, subgraph } = useSynthetixQueries();
	// last 7 days
	const priorDate = Math.floor(new Date().setDate(new Date().getDate() - 7) / 1000);
	const latestSNXPrice = subgraph.useGetRateUpdates(
		{
			first: 1000,
			where: { synth: 'SNX', timestamp_gte: priorDate },
			orderBy: 'timestamp',
			orderDirection: 'asc',
		},
		{ rate: true }
	);
	const cryptoBalances = useCryptoBalances(delegateWallet?.address ?? walletAddress);
	const synthsBalancesQuery = useSynthsBalancesQuery(delegateWallet?.address ?? walletAddress);
	const isL2 = useRecoilValue(isL2State);
	const { clearSubMenuConfiguration } = UIContainer.useContainer();

	const snxBalance =
		cryptoBalances?.balances?.find((balance) => balance.currencyKey === CryptoCurrency.SNX)
			?.balance ?? wei(0);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

	const snxPriceChartData = useMemo(() => {
		return (latestSNXPrice?.data ?? [])
			.map((dataPoint) => ({ value: dataPoint.rate.toNumber() }))
			.slice()
			.reverse();
	}, [latestSNXPrice?.data]);

	return (
		<Container onMouseLeave={clearSubMenuConfiguration} data-testid="sidenav">
			<StakingLogoWrap>
				<Link href={ROUTES.Home}>
					<div>{isL2 ? <Svg src={StakingL2Logo} /> : <Svg src={StakingLogo} />}</div>
				</Link>
			</StakingLogoWrap>

			<SideNav isDesktop={true} />

			<>
				<LineSeparator />
				<MenuCharts>
					<CRatioBarStats />
					<BalanceItem amount={snxBalance} currencyKey={CryptoCurrency.SNX} />
					<BalanceItem amount={sUSDBalance} currencyKey={Synths.sUSD} />
					<PriceItem currencyKey={CryptoCurrency.SNX} data={snxPriceChartData} />
					<PeriodBarStats />
				</MenuCharts>
			</>

			<SubMenu />
		</Container>
	);
};

export default DesktopSideNav;

const Container = styled.div`
	z-index: ${zIndex.DIALOG_OVERLAY};
	height: 100%;
	position: fixed;
	top: 0;
	width: ${DESKTOP_SIDE_NAV_WIDTH}px;
	left: 0;
	background: ${(props) => props.theme.colors.darkGradient1Flipped};
	border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	display: grid;
	grid-template-rows: auto 1fr auto auto;
	overflow-y: hidden;
	overflow-x: visible;
	transition: left 0.3s ease-out;
`;

const StakingLogoWrap = styled.div`
	padding: 30px 0 44px 24px;
	cursor: pointer;
`;

const LineSeparator = styled.div`
	height: 1px;
	background: ${(props) => props.theme.colors.grayBlue};
	margin-bottom: 25px;
`;

const MenuCharts = styled.div`
	margin: 0 auto;
`;
