import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Notify from 'containers/Notify';

import synthetix from 'lib/synthetix';

import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice } from 'utils/network';
import { Transaction } from 'constants/network';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';

import { TabContainer } from '../common';
import TabContent from './TabContent';

const StakingRewardsTab: React.FC = () => {
	const escrowDataQuery = useEscrowDataQuery();

	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
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
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						RewardsEscrowV2.estimateGas.vest
					);
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [synthetix, error]);

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
				error={vestTxError}
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
