import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { useTranslation } from 'react-i18next';

import MigrateTab from '../MigrateTab';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('layer2.actions.migrate.title'),
				tabChildren: <MigrateTab />,
				key: 'migrate',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab singleTab={true} boxPadding={20} tabData={tabData} setPanelType={() => null} />
	);
};

export default ActionBox;
