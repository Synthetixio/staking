import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Notify from 'containers/Notify';

import synthetix from 'lib/synthetix';

import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice } from 'utils/network';
import { Transaction } from 'constants/network';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isWalletConnectedState } from 'store/wallet';

import { TabContainer } from '../common';
import TabContent from './TabContent';

const StakingRewardsTab: React.FC = () => {
	const escrowDataQuery = useEscrowDataQuery();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);

	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [vestTxError, setVestTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const escrowData = escrowDataQuery?.data;
	const canVestAmount = escrowData?.claimableAmount ?? 0;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				const {
					contracts: { RewardEscrow },
				} = synthetix.js!;
				try {
					setGasEstimateError(null);
					const gasEstimate = await getGasEstimateForTransaction([], RewardEscrow.estimateGas.vest);

					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setGasEstimateError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [gasEstimateError, isWalletConnected, isAppReady]);

	const handleVest = useCallback(() => {
		async function vest() {
			if (isAppReady) {
				try {
					setVestTxError(null);
					setTxModalOpen(true);
					const {
						contracts: { RewardEscrow },
					} = synthetix.js!;

					let transaction: ethers.ContractTransaction = await RewardEscrow.vest({
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit: gasLimitEstimate,
					});

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorHash({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
								escrowDataQuery.refetch();
							},
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setVestTxError(e.message);
				}
			}
		}
		vest();
	}, [isAppReady, gasPrice, gasLimitEstimate, escrowDataQuery, monitorHash]);

	return (
		<TabContainer>
			<TabContent
				claimableAmount={canVestAmount}
				onSubmit={handleVest}
				transactionError={vestTxError}
				gasEstimateError={gasEstimateError}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={gasLimitEstimate}
				setGasPrice={setGasPrice}
				txHash={txHash}
				transactionState={transactionState}
				setTransactionState={setTransactionState}
			/>
		</TabContainer>
	);
};

export default StakingRewardsTab;
