import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import IncentivesMainnet from './IncentivesMainnet';
import IncentivesDefault from './IncentivesDefault';

import { isMainnetState, delegateWalletState } from 'store/wallet';

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
	const delegateWallet = useRecoilValue(delegateWalletState);
	const Incentives = isMainnet && !delegateWallet ? IncentivesMainnet : IncentivesDefault;

	return <Incentives {...props} />;
};

export default Incentives;
