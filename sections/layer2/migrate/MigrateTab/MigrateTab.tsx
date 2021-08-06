import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useTranslation } from 'react-i18next';

import { TabContainer } from '../../components/common';
import { GasLimitEstimate } from 'constants/network';

import { walletAddressState } from 'store/wallet';

import TabContent from './TabContent';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { GWEI_UNIT } from 'utils/infura';

const MigrateTab = () => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);

	const { useEscrowDataQuery, useSynthetixTxn } = useSynthetixQueries();

	const escrowDataQuery = useEscrowDataQuery(walletAddress);
	const claimableAmount = escrowDataQuery?.data?.claimableAmount ?? wei(0);
	const escrowData = escrowDataQuery?.data ?? null;
	const totalEscrowed = escrowData?.totalEscrowed ?? wei(0);
	const entryIds = useMemo(() => escrowData?.claimableEntryIdsInChunk ?? [], [escrowData]);

	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [isVestNeeded, setIsVestNeeded] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const txn = useSynthetixTxn('SynthetixBridgeToOptimism', 'migrateEscrow', [entryIds], {
		gasPrice: wei(gasPrice, GWEI_UNIT).toBN(),
	});

	useEffect(() => {
		if (claimableAmount) {
			setIsVestNeeded(true);
		}
	}, [claimableAmount]);

	useEffect(() => {
		if (txn.txnStatus == 'confirmed') {
			escrowDataQuery.refetch();
		}
	}, [txn.txnStatus]);

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
				gasLimitEstimate={gasLimitEstimate}
				setGasPrice={setGasPrice}
				txHash={txn.hash}
				transactionState={txn.txnStatus}
				resetTransaction={txn.refresh}
			/>
		</TabContainer>
	);
};

export default MigrateTab;
