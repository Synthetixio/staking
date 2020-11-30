import { useState } from 'react';
import { createContainer } from 'unstated-next';

export enum StakingPanelType {
	BURN = 'burn',
	MINT = 'mint',
}

const useStaking = () => {
	const [amountToStake, setAmountToStake] = useState<string>('0');
	const [amountToBurn, setAmountToBurn] = useState<string>('0');
	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);

	const onStakingChange = (value: string) => setAmountToStake(value);
	const onBurnChange = (value: string) => setAmountToBurn(value);
	const onPanelChange = (value: StakingPanelType) => setPanelType(value);

	return {
		amountToStake,
		onStakingChange,
		amountToBurn,
		onBurnChange,
		panelType,
		onPanelChange,
	};
};

const Staking = createContainer(useStaking);

export default Staking;
