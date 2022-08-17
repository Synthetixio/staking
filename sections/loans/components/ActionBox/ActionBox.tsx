import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import StructuredTab from 'components/StructuredTab';
import BorrowSynthsTab from './BorrowSynthsTab/BorrowSynthsTab';
import ActiveBorrowsTab from './ActiveBorrowsTab/ActiveBorrowsTab';

type ActionBoxProps = {};

const ActionBox: React.FC<ActionBoxProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const action = router.query.action!;
  const [currentTab, loanId, loanAction] = useMemo(() => {
    let currentTab = 'list';
    let loanType = '';
    let loanId = '';
    let loanAction = '';

    if (action) {
      loanType = action[0];
    }
    if (!loanType || loanType === 'new') {
      currentTab = 'new';
    } else {
      loanId = action[1];
      loanAction = action[2];
    }
    return [currentTab, loanId, loanAction];
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
        tabChildren: <ActiveBorrowsTab {...{ loanId, loanAction }} />,
        key: 'list',
      },
    ],
    [t, loanId, loanAction]
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
