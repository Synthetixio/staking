import React, { useMemo } from 'react';
import MintInfo from './MintInfo';
import BurnInfo from './BurnInfo';
import useStakingCalculations from '../hooks/useStakingCalculations';
import Staking from '../context/StakingContext';

const InfoBox: React.FC = () => {
	const {
		unstakedCollateral,
		currentCRatio,
		debtBalance,
		targetCRatio,
		transferableCollateral,
		stakedCollateral,
		lockedCollateral,
		SNXRate,
		totalEscrowBalance,
	} = useStakingCalculations();
	const { panelType } = Staking.useContainer();

	const returnInfoPanel = useMemo(
		() =>
			panelType === 'mint' ? (
				<MintInfo
					unstakedCollateral={unstakedCollateral}
					stakedCollateral={stakedCollateral}
					transferableCollateral={transferableCollateral}
					currentCRatio={currentCRatio}
					debtBalance={debtBalance}
					lockedCollateral={lockedCollateral}
					targetCRatio={targetCRatio}
					SNXRate={SNXRate}
					totalEscrowBalance={totalEscrowBalance}
				/>
			) : (
				<BurnInfo
					unstakedCollateral={unstakedCollateral}
					stakedCollateral={stakedCollateral}
					transferableCollateral={transferableCollateral}
					currentCRatio={currentCRatio}
					debtBalance={debtBalance}
					lockedCollateral={lockedCollateral}
					targetCRatio={targetCRatio}
					totalEscrowBalance={totalEscrowBalance}
					SNXRate={SNXRate}
				/>
			),
		[
			currentCRatio,
			debtBalance,
			lockedCollateral,
			stakedCollateral,
			transferableCollateral,
			unstakedCollateral,
			targetCRatio,
			SNXRate,
			panelType,
			totalEscrowBalance,
		]
	);
	return returnInfoPanel;
};

export default InfoBox;
