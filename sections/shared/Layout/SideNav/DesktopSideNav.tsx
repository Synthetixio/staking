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
import { Tooltip } from 'styles/common';
import { useTranslation } from 'react-i18next';

import SideNav from './SideNav';
import SubMenu from './DesktopSubMenu';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import useGetCurrencyRateChange from 'hooks/useGetCurrencyRateChange';
import Connector from 'containers/Connector';

const DesktopSideNav: FC = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const { t } = useTranslation();
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const sevenDaysAgoSeconds = Math.floor(new Date().setDate(new Date().getDate() - 7) / 1000);
	const currencyRateChange = useGetCurrencyRateChange(sevenDaysAgoSeconds, 'SNX');
	const cryptoBalances = useCryptoBalances(delegateWallet?.address ?? walletAddress);
	const synthsBalancesQuery = useSynthsBalancesQuery(delegateWallet?.address ?? walletAddress);
	const isL2 = useRecoilValue(isL2State);
	const { clearSubMenuConfiguration } = UIContainer.useContainer();
	const { useSNXData } = useSynthetixQueries();
	const { L1DefaultProvider } = Connector.useContainer();
	const lockedSNXQuery = useSNXData(L1DefaultProvider);
	const tRatio = useMemo(() => {
		if (lockedSNXQuery?.data?.lockedSupply?.gt(1) && lockedSNXQuery?.data?.totalSNXSupply) {
			return lockedSNXQuery.data.lockedSupply
				.div(lockedSNXQuery.data.totalSNXSupply)
				.mul(100)
				.toNumber()
				.toFixed(2);
		}
	}, [lockedSNXQuery?.data?.lockedSupply, lockedSNXQuery?.data?.totalSNXSupply]);

	const snxBalance =
		cryptoBalances?.balances?.find((balance) => balance.currencyKey === CryptoCurrency.SNX)
			?.balance ?? wei(0);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

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
					<Tooltip content={t('common.total-staking.staking-percentage-tooltip')}>
						<StyledTargetStakingRatio>
							<StyledTargetStakingRatioTitle>
								{t('common.total-staking.staking-percentage-title')}
							</StyledTargetStakingRatioTitle>
							{tRatio || '0.00'}%
						</StyledTargetStakingRatio>
					</Tooltip>
					<Tooltip content={t('common.price-change.seven-days')}>
						<PriceItemContainer>
							<PriceItem currencyKey={CryptoCurrency.SNX} currencyRateChange={currencyRateChange} />
						</PriceItemContainer>
					</Tooltip>

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
const PriceItemContainer = styled.div`
	margin-bottom: 18px;
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
	width: 100%;
	padding-left: 20px;
	padding-right: 20px;
`;

const StyledTargetStakingRatio = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	margin-bottom: 18px;
`;

const StyledTargetStakingRatioTitle = styled.h3`
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
	padding-bottom: 5px;
	font-size: 12px;
	margin: 0;
`;
