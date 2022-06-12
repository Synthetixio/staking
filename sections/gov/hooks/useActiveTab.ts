import { useEffect, useState } from 'react';
import { SPACE_KEY } from 'constants/snapshot';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';

export const useActiveTab = () => {
	const router = useRouter();

	const [activeTab, setActiveTab] = useState(
		Array.isArray(router.query.panel) && router.query.panel.length
			? (router.query.panel[0] as SPACE_KEY)
			: SPACE_KEY.COUNCIL
	);

	useEffect(() => {
		if (router.isReady && !Array.isArray(router.query.panel)) {
			router.push(ROUTES.Gov.Space(SPACE_KEY.COUNCIL));
			setActiveTab(SPACE_KEY.COUNCIL);
		} else if (
			router.isReady &&
			Array.isArray(router.query.panel) &&
			activeTab !== router.query.panel[0]
		) {
			setActiveTab(router.query.panel[0] as SPACE_KEY);
		}
	}, [router, activeTab]);

	return { activeTab, setActiveTab };
};

export default useActiveTab;
