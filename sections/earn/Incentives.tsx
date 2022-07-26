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
};

const Incentives: FC<IncentivesProps> = (props) => {
	const { isMainnet } = Connector.useContainer();
	const delegateWallet = useRecoilValue(delegateWalletState);
	const Incentives = isMainnet && !delegateWallet ? IncentivesMainnet : IncentivesDefault;

	return <Incentives {...props} />;
};

export default Incentives;
