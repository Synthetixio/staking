import { useMemo } from 'react';
import { SPACE_KEY } from 'constants/snapshot';
import { useRouter } from 'next/router';

export const useActiveTab = () => {
	const router = useRouter();

	const activeTab = useMemo(
		() =>
			Array.isArray(router.query.panel) && router.query.panel.length
				? (router.query.panel[0] as SPACE_KEY)
				: SPACE_KEY.PROPOSAL,
		[router]
	);

	return activeTab;
};

export default useActiveTab;
