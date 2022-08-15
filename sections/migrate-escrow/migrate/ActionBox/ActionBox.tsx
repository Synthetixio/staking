import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { useTranslation } from 'react-i18next';

import MigrateTab from '../MigrateTab';

const ActionBox: React.FC = () => {
  const { t } = useTranslation();
  const tabData = useMemo(
    () => [
      {
        title: t('migrate-escrow.actions.migrate.title'),
        tabChildren: <MigrateTab />,
        key: 'migrate',
      },
    ],
    [t]
  );

  return <StructuredTab singleTab={true} boxPadding={20} tabData={tabData} />;
};

export default ActionBox;
