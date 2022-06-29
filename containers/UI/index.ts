import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { SubMenuLink } from 'sections/shared/Layout/constants';

export type SubMenuConfiguration = {
	routes: SubMenuLink[] | null;
	topPosition: number;
};

export default createContainer(Container);

function Container() {
	const [isMobileNavOpen, setMobileNavOpen] = useState(false);
	const [networkError, setNetworkError] = useState<string | null>(null);

	return {
		isMobileNavOpen,
		setMobileNavOpen,
		networkError,
		setNetworkError,
	};
}
