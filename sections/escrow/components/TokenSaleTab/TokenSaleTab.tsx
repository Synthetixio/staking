import React, { useState, useEffect } from 'react';

import TabContent from './TabContent';
import { TabContainer } from '../common';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

const TokenSaleTab: React.FC = () => {
  const { walletAddress } = Connector.useContainer();
  const { useTokenSaleEscrowQuery, useSynthetixTxn } = useSynthetixQueries();

  const tokenSaleEscrowQuery = useTokenSaleEscrowQuery(walletAddress);

  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);

  const synthetixTxn = useSynthetixTxn('SynthetixEscrow', 'vest', [], gasPrice);

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
        optimismLayerOneFee={synthetixTxn.optimismLayerOneFee}
      />
    </TabContainer>
  );
};

export default TokenSaleTab;
