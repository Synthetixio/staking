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
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

const StakingRewardsTab: React.FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);

	const { synthetixjs } = Connector.useContainer();

	const { useEscrowDataQuery, useSynthetixTxn } = useSynthetixQueries();

	const escrowDataQuery = useEscrowDataQuery(walletAddress);

	const { monitorTransaction } = TransactionNotifier.useContainer();
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const canVestAmount = escrowDataQuery?.data?.claimableAmount ?? wei(0);
	const claimableEntryIds = escrowDataQuery?.data?.claimableEntryIds ?? null;
	const totalBalancePendingMigration =
		escrowDataQuery?.data?.totalBalancePendingMigration ?? wei(0);

	const txn = useSynthetixTxn(
		'RewardEscrowV2',
		totalBalancePendingMigration.gt(0) ? 'migrateVestingSchedule' : 'vest',
		totalBalancePendingMigration.gt(0) ? [walletAddress] : [claimableEntryIds]
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
