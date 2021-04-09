import styled, { css } from 'styled-components';
import { FC, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import { linkCSS } from 'styles/common';
import { toBigNumber } from 'utils/formatters/number';

import StakingLogo from 'assets/svg/app/staking-logo.svg';
import StakingL2Logo from 'assets/svg/app/staking-l2-logo.svg';
import CaretRightIcon from 'assets/svg/app/caret-right-small.svg';

import useSNX24hrPricesQuery from 'queries/rates/useSNX24hrPricesQuery';
import useCryptoBalances from 'hooks/useCryptoBalances';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import ROUTES from 'constants/routes';
import { CryptoCurrency, Synths } from 'constants/currency';
import { SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import { MENU_LINKS, MENU_LINKS_L2 } from '../constants';

import { isL2State } from 'store/wallet';

import SubMenu from './SubMenu';
import PriceItem from './PriceItem';
import PeriodBarStats from './PeriodBarStats';
import BalanceItem from './BalanceItem';
import CRatioBarStats from './CRatioBarStats';

const getKeyValue = <T extends object, U extends keyof T>(obj: T) => (key: U) => obj[key];

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const menuLinkItemRefs = useRef({});
	const SNX24hrPricesQuery = useSNX24hrPricesQuery();
	const cryptoBalances = useCryptoBalances();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const isL2 = useRecoilValue(isL2State);
	const [subMenuConfiguration, setSubMenuConfiguration] = useState({
		routes: null,
		topPosition: 0,
	});

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

	const menuLinks = isL2 ? MENU_LINKS_L2 : MENU_LINKS;

	return (
		<SideNavContainer
			onMouseLeave={() => setSubMenuConfiguration({ ...subMenuConfiguration, routes: null })}
			data-testid="sidenav"
		>
			<StakingLogoWrap>
				<Link href={ROUTES.Home}>
					{isL2 ? <Svg src={StakingL2Logo} /> : <Svg src={StakingLogo} />}
				</Link>
			</StakingLogoWrap>
			<MenuLinks>
				{menuLinks.map(({ i18nLabel, link, subMenu }, i) => (
					<MenuLinkItem
						ref={(r) => {
							if (subMenu) {
								menuLinkItemRefs.current = { ...menuLinkItemRefs.current, [i]: r };
							}
						}}
						onMouseEnter={() => {
							setSubMenuConfiguration(
								subMenu
									? {
											routes: subMenu as any,
											topPosition: (getKeyValue(menuLinkItemRefs.current) as any)(
												i
											).getBoundingClientRect().y as number,
									  }
									: { ...subMenuConfiguration, routes: null }
							);
						}}
						key={link}
						data-testid={`sidenav-${link}`}
						isActive={
							subMenu
								? !!subMenu.find(({ subLink }) => subLink === asPath)
								: asPath === link || (link !== ROUTES.Home && asPath.includes(link))
						}
					>
						<Link href={link}>
							<a>
								{t(i18nLabel)}
								{subMenu && <Svg src={CaretRightIcon} />}
							</a>
						</Link>
					</MenuLinkItem>
				))}
			</MenuLinks>
			<LineSeparator />
			<MenuCharts>
				<CRatioBarStats />
				<BalanceItem amount={snxBalance} currencyKey={CryptoCurrency.SNX} />
				<BalanceItem amount={sUSDBalance} currencyKey={Synths.sUSD} />
				<PriceItem currencyKey={CryptoCurrency.SNX} data={snxPriceChartData} />
				<PeriodBarStats />
			</MenuCharts>
			<SubMenu currentPath={asPath} config={subMenuConfiguration} />
		</SideNavContainer>
	);
};

const SideNavContainer = styled.div`
	z-index: ${zIndex.BASE};
	height: 100%;
	width: ${SIDE_NAV_WIDTH};
	position: fixed;
	top: 0;
	left: 0;
	background: ${(props) => props.theme.colors.darkGradient1Flipped};
	border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	display: grid;
	grid-template-rows: auto 1fr auto auto;
	overflow-y: hidden;
	overflow-x: visible;
`;

const StakingLogoWrap = styled.div`
	padding: 30px 0 64px 24px;
	cursor: pointer;
`;

const MenuLinks = styled.div`
	padding-left: 24px;
	position: relative;
`;

const MenuLinkItem = styled.div<{ isActive: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;

	svg {
		margin-left: 6px;
	}

	a {
		display: flex;
		align-items: center;
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedMedium};
		text-transform: uppercase;
		opacity: 0.4;
		font-size: 14px;
		cursor: pointer;
		color: ${(props) => props.theme.colors.white};
		&:hover {
			opacity: unset;
			color: ${(props) => props.theme.colors.blue};
			svg {
				color: ${(props) => props.theme.colors.blue};
			}
		}
		${(props) =>
			props.isActive &&
			css`
				opacity: unset;
			`}
	}

	&:after {
		width: 2px;
		height: 40px;
		content: '';
		position: absolute;
		top: 0;
		/* the line needs to outside (so around -3px), however due to overflow issues, it needs to be inside for now */
		right: 0;
		background: ${(props) => props.theme.colors.blue};
		display: none;
		${(props) =>
			props.isActive &&
			css`
				display: block;
			`}
	}
`;

const LineSeparator = styled.div`
	height: 1px;
	background: ${(props) => props.theme.colors.grayBlue};
	margin-bottom: 25px;
`;

const MenuCharts = styled.div`
	margin: 0 auto;
	@media screen and (max-height: 815px) {
		display: none;
	}
`;

export default SideNav;
