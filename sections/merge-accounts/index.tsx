import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';

import Landing from './landing';
import Burn from './burn';
import Nominate from './nominate';
import Merge from './merge';

const Index: FC = () => {
	const isAppReady = useRecoilValue(appReadyState);
	const router = useRouter();

	const activeTab = useMemo(
		() =>
			Array.isArray(router.query.action) && router.query.action.length
				? router.query.action[0]
				: null,
		[router.query.action]
	);

	return !isAppReady ? null : (
		<>
			{activeTab === 'burn' ? (
				<Burn />
			) : activeTab === 'nominate' ? (
				<Nominate />
			) : activeTab === 'merge' ? (
				<Merge />
			) : (
				<Landing />
			)}
		</>
	);
};

export default Index;
