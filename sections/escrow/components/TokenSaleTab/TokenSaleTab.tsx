import React, { useState, useEffect, useCallback } from 'react';
import TransactionNotifier from 'containers/TransactionNotifier';

import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import TabContent from './TabContent';
import { TabContainer } from '../common';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { GWEI_UNIT } from 'utils/infura';

const TokenSaleTab: React.FC = () => {
	const walletAddress = useRecoilValue(walletAddressState);

	const { useTokenSaleEscrowQuery, useSynthetixTxn } = useSynthetixQueries();

	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery(walletAddress);

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<number>(0);

	const synthetixTxn = useSynthetixTxn('SynthetixEscrow', 'vest', [], {
		gasPrice: wei(gasPrice, GWEI_UNIT).toBN(),
	});

	const tokenSaleData = tokenSaleEscrowQuery?.data;
	const canVestAmount = tokenSaleData?.claimableAmount ?? wei(0);

	useEffect(() => {
		switch (synthetixTxn.txnStatus) {
			case 'pending':
				setTxModalOpen(true);
				break;
			case 'confirmed':
				tokenSaleEscrowQuery.refetch();
				break;
		}
	}, [synthetixTxn.txnStatus]);

	return (
		<TabContainer>
			<TabContent
				claimableAmount={canVestAmount}
				onSubmit={() => synthetixTxn.mutate()}
				transactionError={synthetixTxn.errorMessage}
				gasEstimateError={synthetixTxn.errorMessage}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={synthetixTxn.gasLimit}
				setGasPrice={setGasPrice}
				txHash={synthetixTxn.hash}
				transactionState={synthetixTxn.txnStatus}
				onResetTransaction={synthetixTxn.refresh}
			/>
		</TabContainer>
	);
};

export default TokenSaleTab;
