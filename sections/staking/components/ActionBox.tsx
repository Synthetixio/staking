import React, { useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import useStakingCalculations from '../hooks/useStakingCalculations';

import StructuredTab from 'components/StructuredTab';

import BurnTab from './BurnTab';
import MintTab from './MintTab';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { StakingPanelType } from 'pages/staking';

interface ActionBoxProps {
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	amountToBurn: string;
	setAmountToBurn: (amount: string) => void;
	setPanelType: (type: StakingPanelType) => void;
}

const ActionBox: React.FC<ActionBoxProps> = ({
	amountToBurn,
	setAmountToBurn,
	amountToStake,
	setAmountToStake,
	setPanelType,
}) => {
	const { t } = useTranslation();

	const {
		debtBalance,
		targetCRatio,
		stakedCollateral,
		SNXRate,
		unstakedCollateral,
	} = useStakingCalculations();

	const tabData = useMemo(
		() => [
			{
				title: t('staking.actions.mint.title'),
				icon: () => <Svg src={Mint} />,
				tabChildren: (
					<MintTab
						amountToStake={amountToStake}
						setAmountToStake={setAmountToStake}
						targetCRatio={targetCRatio}
						maxCollateral={unstakedCollateral}
						SNXRate={SNXRate}
					/>
				),
			},
			{
				title: t('staking.actions.burn.title'),
				icon: () => <Svg src={Burn} />,
				tabChildren: (
					<BurnTab
						amountToBurn={amountToBurn}
						setAmountToBurn={setAmountToBurn}
						targetCRatio={targetCRatio}
						maxBurnAmount={debtBalance}
						maxCollateral={unstakedCollateral}
						stakedSNX={stakedCollateral}
						SNXRate={SNXRate}
					/>
				),
			},
		],
		[
			amountToStake,
			amountToBurn,
			setAmountToBurn,
			setAmountToStake,
			t,
			targetCRatio,
			debtBalance,
			SNXRate,
			unstakedCollateral,
			stakedCollateral,
		]
	);

	return (
		<StructuredTab
			boxPadding={0}
			boxHeight={400}
			boxWidth={500}
			tabData={tabData}
			setPanelType={setPanelType}
		/>
	);
};

export default ActionBox;
