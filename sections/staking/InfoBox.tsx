import React, { useMemo } from 'react';
import MintInfo from './components/MintInfo';
import BurnInfo from './components/BurnInfo';

interface InfoBoxProps {
	unstakedCollateral: number;
	stakedCollateral: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	lockedCollateral: number;
	amountToStake: string | null;
	targetCRatio: number;
	panelType: 'burn' | 'mint';
}

const InfoBox: React.FC<InfoBoxProps> = ({
	unstakedCollateral,
	stakedCollateral,
	transferableCollateral,
	currentCRatio,
	debtBalance,
	lockedCollateral,
	amountToStake,
	targetCRatio,
	panelType,
}) => {
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
				/>
			) : (
				<BurnInfo
					unstakedCollateral={unstakedCollateral}
					stakedCollateral={stakedCollateral}
					transferableCollateral={transferableCollateral}
					currentCRatio={currentCRatio}
					debtBalance={debtBalance}
					lockedCollateral={lockedCollateral}
					amountToStake={amountToStake}
					targetCRatio={targetCRatio}
				/>
			),
		[
			panelType,
			amountToStake,
			currentCRatio,
			debtBalance,
			lockedCollateral,
			stakedCollateral,
			transferableCollateral,
			unstakedCollateral,
			targetCRatio,
		]
	);
	return returnInfoPanel;
};

export default InfoBox;
