import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Notify from 'containers/Notify';

import synthetix from 'lib/synthetix';

import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice } from 'utils/network';
import { Transaction } from 'constants/network';
import useEscrowDataQuery from 'queries/escrow/useEscrowV2DataQuery';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState } from 'store/wallet';

import { TabContainer } from '../common';
import TabContent from './TabContent';

const StakingRewardsTab: React.FC = () => {
	const escrowDataQuery = useEscrowDataQuery();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

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
	const claimableEntryIds = escrowData?.claimableEntryIds ?? null;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				const {
					contracts: { RewardsEscrowV2 },
				} = synthetix.js;
				try {
					setGasEstimateError(null);
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						RewardsEscrowV2.estimateGas.vest
					);
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setGasEstimateError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [gasEstimateError, isWalletConnected]);

	const handleVest = async () => {
		try {
			setVestTxError(null);
			setTxModalOpen(true);
			const {
				contracts: { RewardEscrowV2 },
			} = synthetix.js!;

			let transaction: ethers.ContractTransaction = await RewardEscrowV2.vest(claimableEntryIds, {
				gasPrice: normalizedGasPrice(gasPrice),
				gasLimitEstimate,
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
	};

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
