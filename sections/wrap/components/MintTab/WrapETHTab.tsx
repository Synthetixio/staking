import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import { useTranslation } from 'react-i18next';

import { Transaction, GasLimitEstimate } from 'constants/network';
import UIContainer from 'containers/UI';
import { normalizedGasPrice } from 'utils/network';
import { toBigNumber } from 'utils/formatters/number';
import Connector from 'containers/Connector';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { TabContainer } from '../common';
// import MintTiles from '../MintTiles';
import WrapInput from '../StakingInput/WrapInput';
import { getMintAmount } from '../helper';
import { useRecoilState, useRecoilValue } from 'recoil';
import { amountToMintState, MintActionType, mintTypeState } from 'store/staking';
import { isWalletConnectedState } from 'store/wallet';
import { appReadyState } from 'store/app';
import TransactionNotifier from 'containers/TransactionNotifier';
import Balance from 'sections/loans/components/ActionBox/components/Balance';

const WrapETHTab: React.FC = () => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const { signer } = Connector.useContainer();

	// Swap States
	const [currentSwapAsset, setCurrentSwapAsset] = useState<string>('');
	const [currentSwapAmount, setCurrentSwapAmount] = React.useState(ethers.BigNumber.from('0'));

	const { setTitle } = UIContainer.useContainer();

	// header title
	useEffect(() => {
		setTitle('staking', 'mint');
	}, [setTitle]);

	//swapAmounts
	useEffect(() => {
		console.log('useEffec2t signer', signer);
		if (!signer) return;
		// console.log('useEffec2t signer', signer);
		const onSetBalance = async () => {
			const balance = await signer.getBalance();
			setCurrentSwapAmount(balance);
			console.log('signe2r2 balance', currentSwapAmount);
			console.log('signe2r2 balance', ethers.utils.formatUnits(currentSwapAmount, 18));
		};
		onSetBalance();
	}, [signer]);

	const returnPanelTwo = () => {
		return (
			<div>
				<h1>test</h1>
				<input
					style={{
						height: 50,
						width: '80%',
						border: '1px solid red',
						background: 'transparent',
						color: 'white',
					}}
				></input>
				{/* <Balance {...{ asset, onSetMaxAmount }} /> */}
			</div>
		);
	};

	return <TabContainer>{returnPanelTwo()}</TabContainer>;
};

export default WrapETHTab;
