import { FC, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { SubMenuLink } from '../../constants';
import { MenuLinkItem } from '../SideNav';

type MobileSubMenuProps = {
	setActiveSubMenu: Dispatch<SetStateAction<null>>;
	activeSubMenu: null;
};

const MobileSubMenu: FC<MobileSubMenuProps> = () => {
	const router = useRouter();

	return (
		<Container>
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
		</Container>
	);
};

const Container = styled.div`
	padding-left: 24px;
`;

export default MobileSubMenu;
