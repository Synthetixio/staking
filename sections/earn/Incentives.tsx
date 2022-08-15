import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';

import IncentivesMainnet from './IncentivesMainnet';
import IncentivesDefault from './IncentivesDefault';

import { delegateWalletState } from 'store/wallet';
import Connector from 'containers/Connector';

type IncentivesProps = {
  tradingRewards: Wei;
  stakingRewards: Wei;
  totalRewards: Wei;
  liquidationRewards: Wei;
  stakingAPR: Wei;
  stakedAmount: Wei;
  hasClaimed: boolean;
  refetchAllRewards: () => void;
};

const Incentives: FC<IncentivesProps> = ({
  tradingRewards,
  stakingRewards,
  totalRewards,
  liquidationRewards,
  stakingAPR,
  stakedAmount,
  hasClaimed,
  refetchAllRewards,
}) => {
  const { isMainnet } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const Incentives = isMainnet && !delegateWallet ? IncentivesMainnet : IncentivesDefault;

  return (
    <Incentives
      tradingRewards={tradingRewards}
      stakingRewards={stakingRewards}
      totalRewards={totalRewards}
      liquidationRewards={liquidationRewards}
      stakingAPR={stakingAPR}
      stakedAmount={stakedAmount}
      hasClaimed={hasClaimed}
      refetchAllRewards={refetchAllRewards}
    />
  );
};

export default Incentives;
