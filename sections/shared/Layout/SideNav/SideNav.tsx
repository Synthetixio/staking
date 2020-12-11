import styled, { css } from 'styled-components';
import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { linkCSS } from 'styles/common';
import ROUTES from 'constants/routes';
import StakingLogo from 'assets/svg/app/staking-logo.svg';

import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import useSNX24hrPricesQuery from 'queries/rates/useSNX24hrPricesQuery';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import { CryptoCurrency } from 'constants/currency';
import { SIDE_NAV_WIDTH, zIndex } from 'constants/ui';
import { Period } from 'constants/period';

import { MENU_LINKS } from '../constants';
import PriceItem from './PriceItem';
import { PeriodBarStats, CRatioBarStats } from './BarStats';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const SNX24hrPricesQuery = useSNX24hrPricesQuery();
	const ETH24hrPricesQuery = useHistoricalRatesQuery(CryptoCurrency.ETH, Period.ONE_DAY);

	const { currentCRatio, targetCRatio } = useStakingCalculations();

	const { nextFeePeriodStarts, currentFeePeriodProgress } = useFeePeriodTimeAndProgress();

	const snxPriceChartData = useMemo(() => {
		return (SNX24hrPricesQuery?.data ?? [])
			.map((dataPoint) => ({ value: dataPoint.averagePrice }))
			.reverse();
	}, [SNX24hrPricesQuery?.data]);

	const ethPriceChartData = useMemo(() => {
		return (ETH24hrPricesQuery?.data?.rates ?? []).map((dataPoint) => ({ value: dataPoint.rate }));
	}, [ETH24hrPricesQuery?.data?.rates]);

	return (
		<SideNavContainer>
			<StakingLogoWrap>
				<Link href={ROUTES.Home}>
					<a>
						<Svg src={StakingLogo} />
					</a>
				</Link>
			</StakingLogoWrap>
			<MenuLinks>
				{MENU_LINKS.map(({ i18nLabel, link }) => (
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
			<MenuCharts>
				<CRatioBarStats currentCRatio={currentCRatio} targetCRatio={targetCRatio} />
				<PriceItem currencyKey={CryptoCurrency.SNX} data={snxPriceChartData} />
				<PriceItem currencyKey={CryptoCurrency.ETH} data={ethPriceChartData} />
				<PeriodBarStats
					nextFeePeriodStarts={nextFeePeriodStarts}
					currentFeePeriodProgress={currentFeePeriodProgress}
				/>
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
	grid-template-rows: auto 1fr auto;
	overflow-y: auto;
`;

const StakingLogoWrap = styled.div`
	padding: 30px 0 87px 30px;
	cursor: pointer;
`;

const MenuLinks = styled.div`
	padding-left: 30px;
	position: relative;
`;

const MenuLinkItem = styled.div<{ isActive: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;

	a {
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedBold};
		text-transform: uppercase;
		font-weight: 700;
		font-size: 14px;
		cursor: pointer;
		opacity: 0.5;
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

const MenuCharts = styled.div`
	border-top: 1px solid ${(props) => props.theme.colors.grayBlue};
	width: 120px;
	margin: 0 auto;
	@media screen and (max-height: 815px) {
		display: none;
	}
`;

export default SideNav;
