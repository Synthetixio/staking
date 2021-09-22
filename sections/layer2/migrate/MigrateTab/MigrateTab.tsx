import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { TabContainer } from '../../components/common';

import { walletAddressState } from 'store/wallet';

import TabContent from './TabContent';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

const MigrateTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);

	const { useEscrowDataQuery, useSynthetixTxn } = useSynthetixQueries();

	const escrowDataQuery = useEscrowDataQuery(walletAddress);
	const claimableAmount = escrowDataQuery?.data?.claimableAmount ?? wei(0);
	const escrowData = escrowDataQuery?.data ?? null;
	const totalEscrowed = escrowData?.totalEscrowed ?? wei(0);
	const entryIds = useMemo(
		() => escrowData?.claimableEntryIdsInChunk?.map((v) => v.map((eid) => eid.toBN())) ?? [],
		[escrowData]
	);

	const [isVestNeeded, setIsVestNeeded] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const txn = useSynthetixTxn('SynthetixBridgeToOptimism', 'migrateEscrow', [entryIds], {
		gasPrice: gasPrice.toBN(),
	});

	useEffect(() => {
		if (claimableAmount.gt(0)) {
			setIsVestNeeded(true);
		}
	}, [claimableAmount]);

	useEffect(() => {
		if (txn.txnStatus === 'confirmed') {
			escrowDataQuery.refetch();
		}
	}, [txn.txnStatus, escrowDataQuery]);

	return (
		<TabContainer>
			<TabContent
				escrowedAmount={totalEscrowed}
				isVestNeeded={isVestNeeded}
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
			/>
		</TabContainer>
	);
};

export default MigrateTab;
