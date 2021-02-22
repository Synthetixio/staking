import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import StructuredTab from 'components/StructuredTab';
import { ACTION_BOX_WIDTH } from 'sections/loans/constants';
import BorrowSynthsTab from './BorrowSynthsTab/BorrowSynthsTab';
import ActiveBorrowsTab from './ActiveBorrowsTab/ActiveBorrowsTab';

type ActionBoxProps = {
	currentTab: string;
};

const ActionBox: React.FC<ActionBoxProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const tabData = useMemo(
		() => [
			{
				title: t('loans.tabs.new.title'),
				tabChildren: <BorrowSynthsTab />,
				key: 'new',
				blue: true,
			},
			{
				title: t('loans.tabs.list.title'),
				tabChildren: <ActiveBorrowsTab />,
				key: 'list',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab
			boxPadding={20}
			boxWidth={ACTION_BOX_WIDTH}
			tabData={tabData}
			setPanelType={(key) => router.push(`/loans/${key}`)}
			currentPanel={t(`loans.tabs.${currentTab}.title`)}
		/>
	);
};

export default ActionBox;
