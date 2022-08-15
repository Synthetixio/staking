import { useState, useEffect, useMemo } from 'react';

import { TabContainer } from '../../components/common';

import TabContent from './TabContent';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

const MigrateTab = () => {
  const { walletAddress } = Connector.useContainer();

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
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const txn = useSynthetixTxn('SynthetixBridgeToOptimism', 'migrateEscrow', [entryIds], gasPrice);

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
        optimismLayerOneFee={txn.optimismLayerOneFee}
      />
    </TabContainer>
  );
};

export default MigrateTab;
