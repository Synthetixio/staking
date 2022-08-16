import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FlexDivCol } from 'styles/common';
import { DebtPanelType } from 'store/debt';

import OverviewTab from './components/OverviewTab';
import ManageTab from './components/ManageTab';
import DebtTabs from './components/DebtTabs';

const DebtSection = () => {
  const { t } = useTranslation();

  const tabData = useMemo(
    () => [
      {
        title: t('debt.actions.track.title'),
        tabChildren: <OverviewTab />,
        key: DebtPanelType.OVERVIEW,
      },
      {
        title: t('debt.actions.manage.title'),
        tabChildren: <ManageTab />,
        key: DebtPanelType.MANAGE,
        width: 450,
      },
    ],
    [t]
  );

  return (
    <FlexDivCol>
      <DebtTabs boxPadding={20} boxHeight={450} boxWidth={450} tabData={tabData} />
    </FlexDivCol>
  );
};

export default DebtSection;
