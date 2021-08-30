import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import StructuredTab from 'components/StructuredTab';
import NominateTab from './NominateTab/NominateTab';
import MergeTab from './MergeTab/MergeTab';

type ActionBoxProps = {};

const ActionBox: FC<ActionBoxProps> = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const currentTab = useMemo(() => {
		// const action = router.query.action!;
		// return action[0];

		return window?.location?.pathname?.match(/\/(\w+)$/)?.[1] ?? 'nominate';
	}, []);

	const tabData = useMemo(
		() => [
			{
				title: t('merge-accounts.tabs.nominate.title'),
				tabChildren: <NominateTab />,
				key: 'nominate',
				blue: true,
			},
			{
				title: t('merge-accounts.tabs.merge.title'),
				tabChildren: <MergeTab />,
				key: 'merge',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab
			boxPadding={20}
			tabData={tabData}
			setPanelType={(key: string) => router.push(`/merge-accounts/${key}`)}
			currentPanel={currentTab}
		/>
	);
};

export default ActionBox;
