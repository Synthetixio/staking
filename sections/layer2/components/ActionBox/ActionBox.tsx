import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useTranslation } from 'react-i18next';

import DepositPanel from '../DepositPanel';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('layer2.actions.deposit.title'),
				tabChildren: <DepositPanel />,
				key: 'deposit',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab
			boxPadding={20}
			boxWidth={BOX_COLUMN_WIDTH}
			tabData={tabData}
			setPanelType={() => null}
		/>
	);
};

export default ActionBox;
