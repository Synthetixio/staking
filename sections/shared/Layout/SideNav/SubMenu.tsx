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
	// const { setMobileNavOpen } = UIContainer.useContainer();
	const subMenuConfiguration: never[] = [];

	return (
		<div>
			{/* {subMenuConfiguration?.routes?.map(({ i18nLabel, subLink }: SubMenuLink, i) => {
				const onClick = () => {
					router.push(subLink);
					setMobileNavOpen(false);
				};
				return (
					<MenuLinkItem
						key={`subMenuLinkItem-${i}`}
						isActive={router.asPath === subLink}
						data-testid={`sidenav-submenu-${subLink}`}
						onClick={onClick}
					>
						{t(i18nLabel)}
					</MenuLinkItem>
				);
			})} */}
		</div>
	);
};

export default SubMenu;
