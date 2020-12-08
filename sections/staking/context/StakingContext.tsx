// import { useState } from 'react';
// import { createContainer } from 'unstated-next';

// const useStaking = () => {
// 	const [amountToMint, setAmountToMint] = useState<string>('');
// 	const [amountToBurn, setAmountToBurn] = useState<string>('');
// 	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);
// 	const [mintType, setMintType] = useState<MintActionType | null>(null);
// 	const [burnType, setBurnType] = useState<BurnActionType | null>(null);

// 	const onMintChange = (value: string) => setAmountToMint(value);
// 	const onBurnChange = (value: string) => setAmountToBurn(value);
// 	const onPanelChange = (value: StakingPanelType) => setPanelType(value);
// 	const onMintTypeChange = (value: MintActionType | null) => setMintType(value);
// 	const onBurnTypeChange = (value: BurnActionType | null) => setBurnType(value);

// 	return {
// 		amountToMint,
// 		onMintChange,
// 		amountToBurn,
// 		onBurnChange,
// 		panelType,
// 		onPanelChange,
// 		mintType,
// 		onMintTypeChange,
// 		burnType,
// 		onBurnTypeChange,
// 	};
// };

// const Staking = createContainer(useStaking);

// export default Staking;
