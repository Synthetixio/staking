import React, { useState, useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

import TabContent from './TabContent';
import { TabContainer } from '../common';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

const TokenSaleTab: React.FC = () => {
	const walletAddress = useRecoilValue(walletAddressState);

	const { useTokenSaleEscrowQuery, useSynthetixTxn } = useSynthetixQueries();

	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery(walletAddress);

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));

	const synthetixTxn = useSynthetixTxn('SynthetixEscrow', 'vest', [], {
		gasPrice: gasPrice.toBN(),
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
	}, [synthetixTxn.txnStatus, tokenSaleEscrowQuery]);

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
