import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { SubMenuLink } from 'sections/shared/Layout/constants';

export type SubMenuConfiguration = {
	routes: SubMenuLink[] | null;
	topPosition: number;
};

export default createContainer(Container);

function Container() {
	const [isShowingMobileSideNav, setIsShowingMobileSideNav] = useState(false);
	const [subMenuConfiguration, setSubMenuConfiguration] = useState<SubMenuConfiguration>({
		routes: null,
		topPosition: 0,
	});
	const isShowingSubMenu = !!subMenuConfiguration?.routes ?? false;

	const clearSubMenuConfiguration = () =>
		setSubMenuConfiguration((subMenuConfiguration: SubMenuConfiguration) => ({
			...subMenuConfiguration,
			routes: null,
		}));

	const showMobileSideNav = () => {
		setIsShowingMobileSideNav(true);
		clearSubMenuConfiguration();
	};
	const closeMobileSideNav = () => setIsShowingMobileSideNav(false);

	return {
		showMobileSideNav,
		closeMobileSideNav,
		isShowingMobileSideNav,

		isShowingSubMenu,
		subMenuConfiguration,
		clearSubMenuConfiguration,
		setSubMenuConfiguration,
	};
}
