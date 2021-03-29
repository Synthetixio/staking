import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import IncentivesMainnet from './IncentivesMainnet';
import IncentivesDefault from './IncentivesDefault';

import { isMainnetState } from 'store/wallet';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	stakingAPR: number;
	stakedAmount: number;
	hasClaimed: boolean;
};

const Incentives: FC<IncentivesProps> = (props) => {
	const isMainnet = useRecoilValue(isMainnetState);
	const Incentives = isMainnet ? IncentivesMainnet : IncentivesDefault;

	return <Incentives {...props} />;
};

export default Incentives;
