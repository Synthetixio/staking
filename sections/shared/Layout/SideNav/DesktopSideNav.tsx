import styled from 'styled-components';
import { FC, useMemo } from 'react';
import Link from 'next/link';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import { toBigNumber } from 'utils/formatters/number';

import StakingLogo from 'assets/svg/app/staking-logo.svg';
import StakingL2Logo from 'assets/svg/app/staking-l2-logo.svg';

import useSNX24hrPricesQuery from 'queries/rates/useSNX24hrPricesQuery';
import useCryptoBalances from 'hooks/useCryptoBalances';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import ROUTES from 'constants/routes';
import { CryptoCurrency, Synths } from 'constants/currency';
import { DESKTOP_SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import SideNavContainer from 'containers/SideNav';

import { isL2State } from 'store/wallet';

import PriceItem from 'sections/shared/Layout/Stats/PriceItem';
import PeriodBarStats from 'sections/shared/Layout/Stats/PeriodBarStats';
import BalanceItem from 'sections/shared/Layout/Stats/BalanceItem';
import CRatioBarStats from 'sections/shared/Layout/Stats/CRatioBarStats';

import SideNav from './SideNav';
import SubMenu from './DesktopSubMenu';

const DesktopSideNav: FC = () => {
	const SNX24hrPricesQuery = useSNX24hrPricesQuery();
	const cryptoBalances = useCryptoBalances();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const isL2 = useRecoilValue(isL2State);
	const { clearSubMenuConfiguration } = SideNavContainer.useContainer();

	const snxBalance =
		cryptoBalances?.balances?.find((balance) => balance.currencyKey === CryptoCurrency.SNX)
			?.balance ?? toBigNumber(0);

	const sUSDBalance =
		synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? toBigNumber(0);

	const snxPriceChartData = useMemo(() => {
		return (SNX24hrPricesQuery?.data ?? [])
			.map((dataPoint) => ({ value: dataPoint.averagePrice }))
			.reverse();
	}, [SNX24hrPricesQuery?.data]);

	return (
		<Container onMouseLeave={clearSubMenuConfiguration} data-testid="sidenav">
			<StakingLogoWrap>
				<Link href={ROUTES.Home}>
					<div>{isL2 ? <Svg src={StakingL2Logo} /> : <Svg src={StakingLogo} />}</div>
				</Link>
			</StakingLogoWrap>

			<SideNav setSubMenuOnItemMouseEnter={true} />

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
	padding: 30px 0 64px 24px;
	cursor: pointer;
`;

const LineSeparator = styled.div`
	height: 1px;
	background: ${(props) => props.theme.colors.grayBlue};
	margin-bottom: 25px;
`;

const MenuCharts = styled.div`
	margin: 0 auto;
	width: calc(100% - 48px);
`;
