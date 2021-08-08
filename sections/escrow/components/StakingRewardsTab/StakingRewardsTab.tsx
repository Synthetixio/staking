import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import TransactionNotifier from 'containers/TransactionNotifier';

import { normalizedGasPrice } from 'utils/network';
import { Transaction, GasLimitEstimate } from 'constants/network';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import { TabContainer } from '../common';
import TabContent from './TabContent';
import MigrateTabContent from './MigrateTabContent';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

const StakingRewardsTab: React.FC = () => {
	const walletAddress = useRecoilValue(walletAddressState);

	const { useEscrowDataQuery, useSynthetixTxn } = useSynthetixQueries();

	const escrowDataQuery = useEscrowDataQuery(walletAddress);

	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const canVestAmount = escrowDataQuery?.data?.claimableAmount ?? wei(0);
	const claimableEntryIds = escrowDataQuery?.data?.claimableEntryIds ?? [];
	const totalBalancePendingMigration =
		escrowDataQuery?.data?.totalBalancePendingMigration ?? wei(0);

	const txn = useSynthetixTxn(
		'RewardEscrowV2',
		totalBalancePendingMigration.gt(0) ? 'migrateVestingSchedule' : 'vest',
		totalBalancePendingMigration.gt(0) ? [walletAddress] : [claimableEntryIds.map((v) => v.toBN())],
		{ gasPrice: gasPrice.toBN() }
	);

	useEffect(() => {
		if (txn.txnStatus == 'pending') {
			setTxModalOpen(true);
		} else if (txn.txnStatus == 'confirmed') {
			escrowDataQuery.refetch();
		}
	}, [txn.txnStatus]);

	return (
		<TabContainer>
			{totalBalancePendingMigration ? (
				<MigrateTabContent
					onSubmit={txn.mutate}
					transactionError={txn.errorMessage}
					gasEstimateError={txn.errorMessage}
					txModalOpen={txModalOpen}
					setTxModalOpen={setTxModalOpen}
					gasLimitEstimate={txn.gasLimit}
					setGasPrice={setGasPrice}
					txHash={txn.hash}
					transactionState={txn.txnStatus}
					setTransactionState={() => txn.refresh()}
				/>
			) : (
				<TabContent
					claimableAmount={canVestAmount}
					onSubmit={txn.mutate}
					transactionError={txn.errorMessage}
					gasEstimateError={txn.errorMessage}
					txModalOpen={txModalOpen}
					setTxModalOpen={setTxModalOpen}
					gasLimitEstimate={txn.gasLimit}
					setGasPrice={setGasPrice}
					txHash={txn.hash}
					transactionState={txn.txnStatus}
					setTransactionState={() => txn.refresh()}
				/>
			)}
		</TabContainer>
	);
};

export default StakingRewardsTab;
