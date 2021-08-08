import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { TabContainer } from '../../components/common';
import { Transaction, GasLimitEstimate } from 'constants/network';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import TransactionNotifier from 'containers/TransactionNotifier';
import { appReadyState } from 'store/app';
import { networkState, walletAddressState } from 'store/wallet';

import TabContent from './TabContent';
import { normalizedGasPrice } from 'utils/network';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

const WithdrawTab = () => {
	const { transferableCollateral } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { useGetBridgeDataQuery, useIsActiveQuery, useSynthetixTxn } = useSynthetixQueries();

	const depositsDataQuery = useGetBridgeDataQuery(walletAddress);
	const withdrawalsInactive = !useIsActiveQuery().data;

	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [amountToWithdraw, setAmountToWithdraw] = useState<Wei>(wei(0));

	const txn = useSynthetixTxn('SynthetixBridgeToBase', 'withdraw', [amountToWithdraw.toBN()]);

	useEffect(() => {
		if (txn.txnStatus == 'confirmed') {
			depositsDataQuery.refetch();
		}
	}, [txn.txnStatus]);

	return (
		<StyledTabContainer>
			<TabContent
				inputValue={amountToWithdraw}
				onInputChange={(value: number) => setAmountToWithdraw(wei(value.toString()))}
				transferableCollateral={transferableCollateral}
				onSubmit={txn.mutate}
				transactionError={txn.errorMessage}
				gasEstimateError={txn.errorMessage}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={txn.gasLimit}
				setGasPrice={setGasPrice}
				txHash={txn.hash}
				transactionState={txn.txnStatus}
				resetTransaction={txn.refresh}
				bridgeInactive={withdrawalsInactive}
			/>
		</StyledTabContainer>
	);
};

const StyledTabContainer = styled(TabContainer)`
	padding: 0;
`;

export default WithdrawTab;
