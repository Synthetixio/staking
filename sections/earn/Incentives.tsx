import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';
import { NetworkId } from '@synthetixio/contracts-interface';

import IncentivesMainnet from './IncentivesMainnet';
import IncentivesDefault from './IncentivesDefault';

import { networkState } from 'store/wallet';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	stakingAPR: number;
	stakedAmount: number;
	hasClaimed: boolean;
};

const Incentives: FC<IncentivesProps> = (props) => {
	const network = useRecoilValue(networkState);
	const Incentives = network?.id === NetworkId.Mainnet ? IncentivesMainnet : IncentivesDefault;

	return <Incentives {...props} />;
};

export default Incentives;
