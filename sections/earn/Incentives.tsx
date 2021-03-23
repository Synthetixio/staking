import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import IncentivesL1 from './IncentivesL1';
import IncentivesL2 from './IncentivesL2';

import { isL2State } from 'store/wallet';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	stakingAPR: number;
	stakedAmount: number;
	hasClaimed: boolean;
};

const Incentives: FC<IncentivesProps> = (props) => {
	const isL2 = useRecoilValue(isL2State);
	const Incentives = isL2 ? IncentivesL2 : IncentivesL1;

	return <Incentives {...props} />;
};

export default Incentives;
