import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { TabContainer } from '../../components/common';
import { Transaction } from 'constants/network';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';

import ApproveModal from 'components/ApproveModal';
import TabContent from './TabContent';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';
import Wei, { wei } from '@synthetixio/wei';

const DepositTab = () => {
	const { t } = useTranslation();
	const { transferableCollateral } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const { synthetixjs } = Connector.useContainer();

	const { useGetBridgeDataQuery, useSynthetixTxn } = useSynthetixQueries();

	const depositsDataQuery = useGetBridgeDataQuery(walletAddress);

	const [isApproved, setIsApproved] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const txn = useSynthetixTxn('SynthetixBridgeToOptimism', 'deposit', [], {
		gasPrice: gasPrice.toBN(),
	});

	const getAllowance = useCallback(async () => {
		if (walletAddress && isAppReady) {
			const {
				contracts: { Synthetix, SynthetixBridgeToOptimism },
			} = synthetixjs!;
			try {
				const allowance = await Synthetix.allowance(
					walletAddress,
					SynthetixBridgeToOptimism.address
				);

				setIsApproved(!!(allowance / 1e18));
			} catch (e) {
				console.log(e);
				setIsApproved(false);
			}
		}
	}, [walletAddress, isAppReady]);

	useEffect(() => {
		getAllowance();
	}, [getAllowance]);

	useEffect(() => {
		if (txn.txnStatus == 'confirmed') {
			depositsDataQuery.refetch();
		}
	}, [txn.txnStatus]);

	return (
		<StyledTabContainer>
			{!isApproved ? (
				<ApproveModal
					description={t('layer2.actions.deposit.action.approve.description')}
					tokenContract="Synthetix"
					contractToApprove="SynthetixBridgeToOptimism"
					onApproved={getAllowance}
				/>
			) : null}
			<TabContent
				depositAmount={transferableCollateral}
				onSubmit={txn.mutate}
				transactionError={txn.errorMessage}
				gasEstimateError={txn.errorMessage}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={txn.gasLimit}
				setGasPrice={setGasPrice}
				txHash={txn.hash}
				transactionState={transactionState}
				setTransactionState={setTransactionState}
			/>
		</StyledTabContainer>
	);
};

const StyledTabContainer = styled(TabContainer)`
	position: relative;
	padding: 0;
`;

export default DepositTab;
