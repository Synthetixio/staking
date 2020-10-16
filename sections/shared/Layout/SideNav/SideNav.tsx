import styled from 'styled-components';
import { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { FlexDivCentered, linkCSS } from 'styles/common';
import StakingLogo from 'assets/inline-svg/app/staking-logo.svg';
import ChangePositive from 'assets/inline-svg/app/change-positive.svg';
import ChangeNegative from 'assets/inline-svg/app/change-negative.svg';

import { MENU_LINKS } from '../constants';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	const isPositive = true;

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
					<FlexDivCentered>
						<p>$5.91</p>
						<FlexDivCentered>
							{isPositive ? <ChangePositive /> : <ChangeNegative />}
							<ChangePrice isPositive={isPositive}>5.45%</ChangePrice>
						</FlexDivCentered>
					</FlexDivCentered>
				</PriceItem>
				<PriceItem>
					<h6>ETH Price</h6>
					<FlexDivCentered>
						<p>$5.91</p>
						<FlexDivCentered>
							{!isPositive ? <ChangePositive /> : <ChangeNegative />}
							<ChangePrice isPositive={!isPositive}>3.45%</ChangePrice>
						</FlexDivCentered>
					</FlexDivCentered>
				</PriceItem>
			</PriceSection>
		</SideNavContainer>
	);
};

const SideNavContainer = styled.div`
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

const PriceItem = styled.div`
	margin: 10px 0px;

	h6 {
		font-family: ${(props) => props.theme.fonts.condensedMedium};
		font-size: 16px;
		font-weight: 400;
		color: ${(props) => props.theme.colors.silver};
		margin: 0;
	}
	p {
		font-family: ${(props) => props.theme.fonts.mono};
		font-weight: 700;
		font-size: 16px;
		margin-right: 5px;
	}
`;

const ChangePrice = styled.div<{ isPositive: boolean }>`
	/* @TODO: Import Inter Font */
	font-family: ${(props) => props.theme.fonts.mono};
	font-weight: 700;
	font-size: 10px;
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
	margin-left: 5px;
`;

export default SideNav;
