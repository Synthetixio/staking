import styled, { css } from 'styled-components';
import { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { linkCSS } from 'styles/common';
import ROUTES from 'constants/routes';
import StakingLogo from 'assets/svg/app/staking-logo.svg';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';

import { MENU_LINKS } from '../constants';

import PriceItem from './PriceItem';

const PRICE_ITEMS = [CRYPTO_CURRENCY_MAP.SNX, CRYPTO_CURRENCY_MAP.ETH] as CurrencyKey[];

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

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
			<PriceSection>
				{PRICE_ITEMS.map((currencyKey) => (
					<PriceItem key={currencyKey} currencyKey={currencyKey} />
				))}
			</PriceSection>
		</SideNavContainer>
	);
};

const SideNavContainer = styled.div`
	height: 100%;
	width: 160px;
	position: fixed;
	top: 0;
	left: 0;
	background: ${(props) => props.theme.colors.darkGradient1};
	border-right: 1px solid ${(props) => props.theme.colors.linedBlue};
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
		height: 40px;
		content: '';
		position: absolute;
		right: -3px;
		border-right: ${(props) =>
			props.isActive ? `2px solid ${props.theme.colors.brightBlue}` : 'none'};
	}
`;

const PriceSection = styled.div`
	padding: 30px 0 30px 30px;
	border-top: 1px solid ${(props) => props.theme.colors.linedBlue};
`;

export default SideNav;
