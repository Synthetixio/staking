import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import MintTab from './components/MintTab';
import BurnTab from './components/BurnTab';

import StructuredTab from 'components/StructuredTab';
import { LoadingState } from 'constants/loading';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { StakingPanelType } from 'pages/staking';

interface MintBurnBoxProps {
	targetCRatio: number;
	maxIssuabledSynthAmount: number;
	maxBurnAmount: number;
	snxPrice: number;
	amountToBurn: string;
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	setAmountToBurn: (amount: string) => void;
	setPanelType: (type: StakingPanelType) => void;
	stakedSNX: number;
}

const MintBurnBox: FC<MintBurnBoxProps> = ({
	targetCRatio,
	maxIssuabledSynthAmount,
	maxBurnAmount,
	snxPrice,
	amountToBurn,
	amountToStake,
	setAmountToBurn,
	setAmountToStake,
	setPanelType,
	stakedSNX,
}) => {
	const { t } = useTranslation();

	const [mintLoadingState, setMintLoadingState] = useState<LoadingState | null>(null);
	const [burnLoadingState, setBurnLoadingState] = useState<LoadingState | null>(null);

	const tabData = useMemo(
		() => [
			{
				title: t('staking.actions.mint.title'),
				icon: () => <Svg src={Mint} />,
				tabChildren: (
					<MintTab
						amountToStake={amountToStake}
						setAmountToStake={setAmountToStake}
						mintLoadingState={mintLoadingState}
						setMintLoadingState={setMintLoadingState}
						targetCRatio={targetCRatio}
						maxIssuabledSynthAmount={maxIssuabledSynthAmount}
						snxPrice={snxPrice}
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
						burnLoadingState={burnLoadingState}
						setBurnLoadingState={setBurnLoadingState}
						targetCRatio={targetCRatio}
						maxBurnAmount={maxBurnAmount}
						snxPrice={snxPrice}
						stakedSNX={stakedSNX}
					/>
				),
			},
		],
		[
			amountToStake,
			mintLoadingState,
			amountToBurn,
			burnLoadingState,
			maxBurnAmount,
			maxIssuabledSynthAmount,
			setAmountToBurn,
			setAmountToStake,
			snxPrice,
			stakedSNX,
			t,
			targetCRatio,
		]
	);
	return (
		<StructuredTab
			boxPadding={25}
			boxHeight={400}
			boxWidth={450}
			tabData={tabData}
			setPanelType={setPanelType}
		/>
	);
};

export default MintBurnBox;
