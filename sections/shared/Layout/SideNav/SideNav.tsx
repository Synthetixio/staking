import styled from 'styled-components';
import { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { linkCSS } from 'styles/common';

import { MENU_LINKS } from '../constants';

const SideNav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	return (
		<SideNavContainer>
			<StatsLogoWrap>
				<div>Logo Goes Here</div>
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
	width: 240px;
	position: absolute;
	top: 0;
	left: 0;
`;

const MenuLinks = styled.div`
	display: flex;
	flex-direction: column;
	padding-top: 20px;
`;

const MenuLinkItem = styled.div<{ isActive: boolean }>`
	padding-bottom: 40px;
	padding-left: 20px;
	a {
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.condensedBold};
		text-transform: capitalize;
		color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
		&:hover {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const StatsLogoWrap = styled.div`
	margin-top: 20px;
	margin-bottom: 60px;
`;

export default SideNav;
