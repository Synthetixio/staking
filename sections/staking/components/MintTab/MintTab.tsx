import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import UIContainer from 'containers/UI';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { TabContainer } from '../common';
import MintTiles from '../MintTiles';
import StakingInput from '../StakingInput';
import { getMintAmount } from '../helper';
import { useRecoilState, useRecoilValue } from 'recoil';
import { amountToMintState, MintActionType, mintTypeState } from 'store/staking';
import { delegateWalletState } from 'store/wallet';
import { parseSafeWei } from 'utils/parse';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { GWEI_UNIT } from 'utils/infura';

const MintTab: React.FC = () => {
	const delegateWallet = useRecoilValue(delegateWalletState);

	const { useSynthetixTxn } = useSynthetixQueries();

	const [mintType, onMintTypeChange] = useRecoilState(mintTypeState);
	const [amountToMint, onMintChange] = useRecoilState(amountToMintState);

	const [isMax, setIsMax] = useState<boolean>(false);

	const { targetCRatio, SNXRate, unstakedCollateral } = useStakingCalculations();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const { t } = useTranslation();

	const { setTitle } = UIContainer.useContainer();

	const amountToMintBN = wei(amountToMint);

	const mintCall: [string, any[]] = !!delegateWallet
		? isMax
			? ['issueMaxSynthsOnBehalf', [delegateWallet]]
			: ['issueSynthsOnBehalf', [delegateWallet, amountToMintBN]]
		: isMax
		? ['issueMaxSynths', []]
		: ['issueSynths', [amountToMintBN]];

	const txn = useSynthetixTxn('Synthetix', mintCall[0], mintCall[1], {
		gasPrice: wei(gasPrice, GWEI_UNIT).toBN(),
	});

	let error: string | null = null;

	// header title
	useEffect(() => {
		setTitle('staking', 'mint');
	}, [setTitle]);

	const returnPanel = useMemo(() => {
		let onSubmit;
		let inputValue = wei(0);
		let isLocked;
		switch (mintType) {
			case MintActionType.MAX:
				const mintAmount = getMintAmount(targetCRatio, unstakedCollateral, SNXRate);
				onSubmit = () => txn.mutate();
				setIsMax(true);
				isLocked = true;
				break;
			case MintActionType.CUSTOM:
				onSubmit = () => txn.mutate();
				setIsMax(false);
				inputValue = parseSafeWei(amountToMint, 0);
				isLocked = false;
				break;
			default:
				return <MintTiles />;
		}
		return (
			<StakingInput
				onSubmit={onSubmit}
				inputValue={inputValue}
				isLocked={isLocked}
				isMint={true}
				onBack={onMintTypeChange}
				error={error || txn.errorMessage}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={txn.gasLimit}
				setGasPrice={setGasPrice}
				onInputChange={onMintChange}
				txHash={txn.hash}
				transactionState={txn.txnStatus}
				resetTransaction={txn.refresh}
			/>
		);
	}, [
		mintType,
		error,
		txModalOpen,
		SNXRate,
		amountToMint,
		onMintChange,
		onMintTypeChange,
		targetCRatio,
		unstakedCollateral,
	]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

export default MintTab;
function useSynthetixTxn(
	arg0: string,
	mintFunction: ({
		isMax,
	}: {
		isMax?: boolean | undefined;
	}) => 'issueMaxSynthsOnBehalf' | 'issueSynthsOnBehalf' | 'issueMaxSynths' | 'issueSynths',
	arg2: ethers.BigNumber[]
) {
	throw new Error('Function not implemented.');
}
