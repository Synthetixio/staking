import { useState, useEffect } from 'react';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';

import { TabContainer } from '../common';
import TabContent from './TabContent';
import MigrateTabContent from './MigrateTabContent';
import Connector from 'containers/Connector';

const StakingRewardsTab: React.FC = () => {
  const { walletAddress } = Connector.useContainer();
  const { useEscrowDataQuery, useSynthetixTxn } = useSynthetixQueries();

  const escrowDataQuery = useEscrowDataQuery(walletAddress);

  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const canVestAmount = escrowDataQuery?.data?.claimableAmount ?? wei(0);
  const claimableEntryIds = escrowDataQuery?.data?.claimableEntryIds ?? [];
  const totalBalancePendingMigration =
    escrowDataQuery?.data?.totalBalancePendingMigration ?? wei(0);

  const txn = useSynthetixTxn(
    'RewardEscrowV2',
    totalBalancePendingMigration.gt(0) ? 'migrateVestingSchedule' : 'vest',
    totalBalancePendingMigration.gt(0) ? [walletAddress] : [claimableEntryIds.map((v) => v.toBN())],
    gasPrice
  );

  useEffect(() => {
    if (txn.txnStatus === 'pending') {
      setTxModalOpen(true);
    } else if (txn.txnStatus === 'confirmed') {
      escrowDataQuery.refetch();
    }
  }, [txn.txnStatus, escrowDataQuery]);

  return (
    <TabContainer>
      {totalBalancePendingMigration.gt(0) ? (
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
          optimismLayerOneFee={txn.optimismLayerOneFee}
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
          optimismLayerOneFee={txn.optimismLayerOneFee}
        />
      )}
    </TabContainer>
  );
};

export default StakingRewardsTab;
