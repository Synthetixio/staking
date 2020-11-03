import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import MintTab from './components/MintTab';
import BurnTab from './components/BurnTab';

import StructuredTab from 'components/StructuredTab';
import { LoadingState } from 'constants/loading';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';

interface MintBurnBoxProps {}

const MintBurnBox: FC<MintBurnBoxProps> = ({}) => {
	const { t } = useTranslation();
	const [amountToMint, setAmountToMint] = useState<number>(0);
	const [amountToBurn, setAmountToBurn] = useState<number>(0);

	const [mintLoadingState, setMintLoadingState] = useState<LoadingState | null>(null);
	const [burnLoadingState, setBurnLoadingState] = useState<LoadingState | null>(null);

	const tabData = useMemo(
		() => [
			{
				title: t('staking.actions.mint.title'),
				icon: () => <Svg src={Mint} />,
				tabChildren: (
					<MintTab
						amountToMint={amountToMint}
						setAmountToMint={setAmountToMint}
						mintLoadingState={mintLoadingState}
						setMintLoadingState={setMintLoadingState}
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
		[amountToMint, mintLoadingState, amountToBurn, burnLoadingState]
	);
	return <StructuredTab boxPadding={25} boxHeight={400} boxWidth={450} tabData={tabData} />;
};

export default MintBurnBox;
