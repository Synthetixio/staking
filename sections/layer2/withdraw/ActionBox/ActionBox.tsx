import React, { useMemo } from 'react';
import StructuredTab from 'components/StructuredTab';
import { useTranslation } from 'react-i18next';

import WithdrawTab from '../WithdrawTab';

const ActionBox: React.FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('layer2.actions.withdraw.title'),
				tabChildren: <WithdrawTab />,
				key: 'deposit',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab
			singleTab={true}
			boxPadding={20}
			boxHeight={420}
			tabData={tabData}
			setPanelType={() => null}
		/>
	);
};

export default ActionBox;
