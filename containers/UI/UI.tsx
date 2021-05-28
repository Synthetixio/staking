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
	const [headerTitle, setHeaderTitle] = useState<string | null>(null);
	const [headerSubtitle, setHeaderSubtitle] = useState<string | null>(null);

	const [networkError, setNetworkError] = useState<string | null>(null);

	const isShowingSubMenu = !!subMenuConfiguration?.routes;

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

	const setTitle = (title: string, subtitle?: string | null) => {
		setHeaderTitle(title);
		setHeaderSubtitle(subtitle ?? null);
	};

	return {
		showMobileSideNav,
		closeMobileSideNav,
		isShowingMobileSideNav,

		isShowingSubMenu,
		subMenuConfiguration,
		clearSubMenuConfiguration,
		setSubMenuConfiguration,

		headerTitle,
		headerSubtitle,

		setTitle,

		networkError,
		setNetworkError,
	};
}
