import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import BN from 'bn.js';

import IncentivesMainnet from './IncentivesMainnet';
import IncentivesDefault from './IncentivesDefault';

import { isMainnetState } from 'store/wallet';

type IncentivesProps = {
	tradingRewards: BN;
	stakingRewards: BN;
	totalRewards: BN;
	stakingAPR: BN;
	stakedAmount: BN;
	hasClaimed: boolean;
};

const Incentives: FC<IncentivesProps> = (props) => {
	const isMainnet = useRecoilValue(isMainnetState);
	const Incentives = isMainnet ? IncentivesMainnet : IncentivesDefault;

	return <Incentives {...props} />;
};

export default Incentives;
