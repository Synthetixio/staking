import { FC } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import UIContainer from 'containers/UI';
import { linkCSS } from 'styles/common';
import media from 'styles/media';
import { SubMenuLink } from '../constants';

const SubMenu: FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { closeMobileSideNav, subMenuConfiguration } = UIContainer.useContainer();

	return (
		<div>
			{subMenuConfiguration?.routes?.map(({ i18nLabel, subLink }: SubMenuLink, i) => {
				const onClick = () => {
					router.push(subLink);
					closeMobileSideNav();
				};
				return (
					<MenuLinkItem
						key={`subMenuLinkItem-${i}`}
						isActive={router.asPath === subLink}
						data-testid={`sidenav-submenu-${subLink}`}
						{...{ onClick }}
					>
						{t(i18nLabel)}
					</MenuLinkItem>
				);
			}) ?? null}
		</div>
	);
};

const MenuLinkItem = styled.div<{ isActive: boolean }>`
	line-height: 40px;
	padding-bottom: 10px;
	position: relative;

	white-space: nowrap;
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
	}
	${(props) =>
		props.isActive &&
		css`
			opacity: unset;
		`}

	${media.lessThan('md')`
		font-family: ${(props) => props.theme.fonts.extended};
		font-size: 20px;
		opacity: 1;
	`}
`;

export default SubMenu;
