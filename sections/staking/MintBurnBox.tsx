import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import MintTab from './components/MintTab';
import BurnTab from './components/BurnTab';

import StructuredTab from 'components/StructuredTab';
import { LoadingState } from 'constants/loading';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';

interface MintBurnBoxProps {
	issuanceRatio: number;
	maxIssuabledSynthAmount: number;
	snxPrice: number;
}

const MintBurnBox: FC<MintBurnBoxProps> = ({
	issuanceRatio,
	maxIssuabledSynthAmount,
	snxPrice,
}) => {
	const { t } = useTranslation();
	const [amountToStake, setAmountToStake] = useState<string>('');
	const [amountToBurn, setAmountToBurn] = useState<string>('');

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
						issuanceRatio={issuanceRatio}
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
					/>
				),
			},
		],
		[amountToStake, mintLoadingState, amountToBurn, burnLoadingState]
	);
	return <StructuredTab boxPadding={25} boxHeight={400} boxWidth={450} tabData={tabData} />;
};

export default MintBurnBox;
