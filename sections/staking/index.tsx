import { FC, useState } from 'react';
import styled from 'styled-components';

import { StakingPanelType } from 'pages/staking';

import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { Row, FlexDivCol } from 'styles/common';
import InfoBox from './components/InfoBox';
import ActionBox from './components/ActionBox';

const Index: FC = () => {
	const [amountToStake, setAmountToStake] = useState<string>('0');
	const [amountToBurn, setAmountToBurn] = useState<string>('0');
	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);
	return (
		<Row>
			<InfoBoxWrap>
				<InfoBox amountToBurn={amountToBurn} amountToStake={amountToStake} panelType={panelType} />
			</InfoBoxWrap>
			<ActionBox
				amountToStake={amountToStake}
				setAmountToStake={setAmountToStake}
				amountToBurn={amountToBurn}
				setAmountToBurn={setAmountToBurn}
				setPanelType={setPanelType}
			/>
		</Row>
	);
};

const InfoBoxWrap = styled(FlexDivCol)`
	width: ${BOX_COLUMN_WIDTH}px;
`;

export default Index;
