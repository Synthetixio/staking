import React, { useMemo } from 'react';

import { Svg } from 'react-optimized-image';
import StructuredTab from 'components/StructuredTab';
import Claim from 'assets/svg/app/claim.svg';
import { useTranslation } from 'react-i18next';
import ClaimTab from './components/ClaimTab';

interface ClaimBoxProps {}

const ClaimBox: React.FC<ClaimBoxProps> = ({}) => {
	const { t } = useTranslation();
	const tabData = useMemo(
		() => [
			{
				title: t('earn.actions.claim.title'),
				icon: () => <Svg src={Claim} />,
				tabChildren: <ClaimTab />,
			},
		],
		[t]
	);
	return (
		<StructuredTab
			boxPadding={25}
			boxHeight={400}
			boxWidth={450}
			tabData={tabData}
			setPanelType={() => {}}
		/>
	);
};

export default ClaimBox;
