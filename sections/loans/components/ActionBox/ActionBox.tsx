import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import StructuredTab from 'components/StructuredTab';
import { LOAN_TYPE_ETH } from 'sections/loans/constants';
import BorrowSynthsTab from './BorrowSynthsTab/BorrowSynthsTab';
import ActiveBorrowsTab from './ActiveBorrowsTab/ActiveBorrowsTab';

type ActionBoxProps = {};

const ActionBox: React.FC<ActionBoxProps> = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const action = router.query.action!;
	const [currentTab, loanType, loanId, loanAction] = useMemo(() => {
		let currentTab = 'list';
		let loanType: string = '';
		let loanId: string = '';
		let loanAction: string = '';

		if (action) {
			loanType = action[0];
		}
		if (!loanType || loanType === 'new') {
			currentTab = 'new';
		} else {
			loanId = action[1];
			loanAction = action[2];
		}
		return [currentTab, loanType, loanId, loanAction];
	}, [action]);

	const tabData = useMemo(
		() => [
			{
				title: t('loans.tabs.new.title'),
				tabChildren: <BorrowSynthsTab />,
				key: 'new',
			},
			{
				title: t('loans.tabs.list.title'),
				tabChildren: (
					<ActiveBorrowsTab
						loanTypeIsETH={loanType === LOAN_TYPE_ETH}
						{...{ loanId, loanAction }}
					/>
				),
				key: 'list',
			},
		],
		[t, loanId, loanAction, loanType]
	);

	return (
		<StructuredTab
			boxPadding={20}
			tabData={tabData}
			setActiveTab={(key: string) => router.push(`/loans/${key}`)}
			activeTab={currentTab}
		/>
	);
};

export default ActionBox;
