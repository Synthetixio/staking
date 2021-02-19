import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import StructuredTab from 'components/StructuredTab';

import { ACTION_BOX_WIDTH } from 'sections/loans/constants';
import BorrowSynthsTab from './BorrowSynthsTab/BorrowSynthsTab';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('loans.tabs.form.title'),
				tabChildren: <BorrowSynthsTab />,
				key: 'form',
				blue: true,
			},
			{
				title: t('loans.tabs.table.title'),
				tabChildren: <BorrowSynthsTab />,
				key: 'table',
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
			setPanelType={() => null}
		/>
	);
};

export default ActionBox;
