import React, { useMemo } from 'react';
import MintInfo from './MintInfo';
import BurnInfo from './BurnInfo';
import useStakingCalculations from '../hooks/useStakingCalculations';

interface InfoBoxProps {
	amountToStake: string | null;
	amountToBurn: string | null;
	panelType: 'burn' | 'mint';
}

const InfoBox: React.FC<InfoBoxProps> = ({ amountToBurn, amountToStake, panelType }) => {
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
					amountToStake={amountToStake}
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
					amountToBurn={amountToBurn}
					targetCRatio={targetCRatio}
					totalEscrowBalance={totalEscrowBalance}
					SNXRate={SNXRate}
				/>
			),
		[
			panelType,
			amountToStake,
			amountToBurn,
			currentCRatio,
			debtBalance,
			lockedCollateral,
			stakedCollateral,
			transferableCollateral,
			unstakedCollateral,
			targetCRatio,
			SNXRate,
			totalEscrowBalance,
		]
	);
	return returnInfoPanel;
};

export default InfoBox;
