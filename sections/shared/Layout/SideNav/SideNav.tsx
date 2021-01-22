import styled, { css } from 'styled-components';
import { useRecoilValue } from 'recoil';
import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { linkCSS } from 'styles/common';

import StakingLogo from 'assets/svg/app/staking-logo.svg';
import StakingL2Logo from 'assets/svg/app/staking-l2-logo.svg';

import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import useSNX24hrPricesQuery from 'queries/rates/useSNX24hrPricesQuery';
import useEscrowDataQuery from 'hooks/useEscrowDataQueryWrapper';

import { isLayerOneState } from 'store/chain';

import ROUTES from 'constants/routes';
import { CryptoCurrency } from 'constants/currency';
import { SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import { Period } from 'constants/period';

import { MENU_LINKS, MIGRATE_MENU_LINKS, L2_MENU_LINKS } from '../constants';
import PriceItem from './PriceItem';
import PeriodBarStats from './PeriodBarStats';
import CRatioBarStats from './CRatioBarStats';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const SNX24hrPricesQuery = useSNX24hrPricesQuery();
	const ETH24hrPricesQuery = useHistoricalRatesQuery(CryptoCurrency.ETH, Period.ONE_DAY);
	const isLayer1 = useRecoilValue(isLayerOneState);

	const snxPriceChartData = useMemo(() => {
		return (SNX24hrPricesQuery?.data ?? [])
			.map((dataPoint) => ({ value: dataPoint.averagePrice }))
			.reverse();
	}, [SNX24hrPricesQuery?.data]);

	const ethPriceChartData = useMemo(() => {
		return (ETH24hrPricesQuery?.data?.rates ?? []).map((dataPoint) => ({ value: dataPoint.rate }));
	}, [ETH24hrPricesQuery?.data?.rates]);

	const rewardEscrowQuery = useEscrowDataQuery();
	const totalBalancePendingMigration = rewardEscrowQuery?.data?.totalBalancePendingMigration ?? 0;

	const menuLinks = !isLayer1
		? L2_MENU_LINKS
		: totalBalancePendingMigration > 0
		? MIGRATE_MENU_LINKS
		: MENU_LINKS;

	return (
		<SideNavContainer>
			<StakingLogoWrap>
				<Link href={ROUTES.Home}>
					<a>{isLayer1 ? <Svg src={StakingLogo} /> : <Svg src={StakingL2Logo} />}</a>
				</Link>
			</StakingLogoWrap>
			<MenuLinks>
				{menuLinks.map(({ i18nLabel, link }) => (
					<MenuLinkItem
						key={link}
						isActive={asPath === link || (link !== ROUTES.Home && asPath.includes(link))}
					>
						<Link href={link}>
							<a>{t(i18nLabel)}</a>
						</Link>
					</MenuLinkItem>
				))}
			</MenuLinks>
			<LineSeparator />
			<MenuCharts>
				<CRatioBarStats />
				<PriceItem currencyKey={CryptoCurrency.SNX} data={snxPriceChartData} />
				<PriceItem currencyKey={CryptoCurrency.ETH} data={ethPriceChartData} />
				<PeriodBarStats />
			</MenuCharts>
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
`;

const StakingLogoWrap = styled.div`
	padding: 30px 0 87px 24px;
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

	a {
		display: block;
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedMedium};
		text-transform: uppercase;
		opacity: 0.4;
		font-size: 14px;
		cursor: pointer;
		color: ${(props) => props.theme.colors.white};
		&:hover {
			opacity: unset;
			color: ${(props) => props.theme.colors.white};
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
