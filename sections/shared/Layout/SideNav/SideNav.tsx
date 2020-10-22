import styled from 'styled-components';
import { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, linkCSS } from 'styles/common';
import StakingLogo from 'assets/inline-svg/app/staking-logo.svg';

import { MENU_LINKS } from '../constants';
import CurrencyPrice from 'components/Currency/CurrencyPrice';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import { Period } from 'constants/period';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	const currencyRatesQuery = useCurrencyRatesQuery(['ETH', 'SNX']);
	const currencyRates = currencyRatesQuery.data ?? null;
	const ethHistoricalRate = useHistoricalRatesQuery('ETH', Period.ONE_DAY);
	const snxHistoricalRate = useHistoricalRatesQuery('SNX', Period.ONE_DAY);

	return (
		<SideNavContainer>
			<StakingLogoWrap>
				<Link href="/">
					<StakingLogo />
				</Link>
			</StakingLogoWrap>
			<MenuLinks>
				{MENU_LINKS.map(({ i18nLabel, link }) => (
					<MenuLinkItem key={link} isActive={asPath.includes(link)}>
						<Link href={link}>
							<a>{t(i18nLabel)}</a>
						</Link>
					</MenuLinkItem>
				))}
			</MenuLinks>
			<PriceSection>
				<PriceItem>
					<h6>SNX Price</h6>
					<StyledCurrencyPrice
						currencyKey={'SNX'}
						price={currencyRates?.SNX ?? 0}
						sign="$"
						change={snxHistoricalRate?.data?.change}
					/>
				</PriceItem>
				<PriceItem>
					<h6>ETH Price</h6>
					<StyledCurrencyPrice
						currencyKey={'ETH'}
						price={currencyRates?.ETH ?? 0}
						sign="$"
						change={ethHistoricalRate?.data?.change}
					/>
				</PriceItem>
			</PriceSection>
		</SideNavContainer>
	);
};

const SideNavContainer = styled.div`
	z-index: 1;
	overflow-x: hidden;
	padding-top: 20px;
	height: 100%;
	width: 180px;
	position: absolute;
	padding-top: 40px;
	padding-left: 40px;
	top: 0;
	left: 0;
	background-color: ${(props) => props.theme.colors.mediumBlue};
`;

const MenuLinks = styled.div`
	display: flex;
	flex-direction: column;
	padding-top: 20px;
`;

const MenuLinkItem = styled.div<{ isActive: boolean }>`
	line-height: 40px;
	border-right: ${(props) =>
		props.isActive ? `1px solid ${props.theme.colors.brightBlue}` : 'none'};
	a {
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedBold};
		text-transform: uppercase;
		font-weight: 700;
		font-size: 14px;
		color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
		&:hover {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const StakingLogoWrap = styled.div`
	margin-bottom: 100px;
	cursor: pointer;
`;

const PriceSection = styled.div`
	position: absolute;
	bottom: 0;
	padding: 20px 0px;
`;

const PriceItem = styled(FlexDivCol)`
	margin: 10px 0px;

	h6 {
		font-family: ${(props) => props.theme.fonts.condensedMedium};
		font-size: 16px;
		font-weight: 400;
		color: ${(props) => props.theme.colors.silver};
		margin: 0px 0px 4px 0px;
	}
`;

const StyledCurrencyPrice = styled(CurrencyPrice)`
	display: flex;
	.price {
		margin-right: 8px;
		font-family: ${(props) => props.theme.fonts.mono};
		width: 85px;
	}
	.percent {
		font-family: ${(props) => props.theme.fonts.interBold};
		font-size: 10px;
	}
`;
export default SideNav;
