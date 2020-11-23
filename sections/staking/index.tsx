import { FC, useState } from 'react';

import { StakingPanelType } from 'pages/staking';

import { Column, Row } from 'styles/common';
import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';

const Index: FC = ({}) => {
	const [amountToStake, setAmountToStake] = useState<string>('0');
	const [amountToBurn, setAmountToBurn] = useState<string>('0');
	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);
	return (
		<Row>
			<Column>
				<InfoBox amountToBurn={amountToBurn} amountToStake={amountToStake} panelType={panelType} />
			</Column>
			<Column>
				<ActionBox
					amountToStake={amountToStake}
					setAmountToStake={setAmountToStake}
					amountToBurn={amountToBurn}
					setAmountToBurn={setAmountToBurn}
					setPanelType={setPanelType}
				/>
			</Column>
		</Row>
	);
};

export default Index;
