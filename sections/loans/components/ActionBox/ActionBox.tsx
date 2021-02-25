import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import StructuredTab from 'components/StructuredTab';
import { ACTION_BOX_WIDTH } from 'sections/loans/constants';
import BorrowSynthsTab from './BorrowSynthsTab/BorrowSynthsTab';
import ActiveBorrowsTab from './ActiveBorrowsTab/ActiveBorrowsTab';

type ActionBoxProps = {};

const ActionBox: React.FC<ActionBoxProps> = ({}) => {
	const { t } = useTranslation();
	const router = useRouter();

	const action = router.query.action!;
	let currentTab = 'list';
	let loanId: number = 0;
	let loanIdString: string = '',
		loanAction: string = '';
	if (action) {
		loanIdString = action[0];
	}
	if (!loanIdString || loanIdString === 'new') {
		currentTab = 'new';
	} else {
		loanId = parseInt(loanIdString);
		loanAction = action[1];
	}

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
				tabChildren: <ActiveBorrowsTab {...{ loanId, loanAction }} />,
				key: 'list',
				blue: true,
			},
		],
		[t, loanId, loanAction]
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
