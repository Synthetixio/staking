import styled from 'styled-components';
import { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { linkCSS } from 'styles/common';
import StakingLogo from 'assets/inline-svg/app/staking-logo.svg';

import { MENU_LINKS } from '../constants';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	return (
		<SideNavContainer>
			<StatsLogoWrap>
				<StakingLogo />
			</StatsLogoWrap>
			<MenuLinks>
				{MENU_LINKS.map(({ i18nLabel, link }) => (
					<MenuLinkItem key={link} isActive={asPath.includes(link)}>
						<Link href={link}>
							<a>{t(i18nLabel)}</a>
						</Link>
					</MenuLinkItem>
				))}
			</MenuLinks>
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

const StatsLogoWrap = styled.div`
	margin-bottom: 100px;
`;

export default SideNav;
