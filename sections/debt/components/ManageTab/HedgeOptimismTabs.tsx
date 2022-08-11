import { TabButton } from 'components/Tab';
import { useState } from 'react';
import styled from 'styled-components';
import { FlexDivJustifyCenter } from 'styles/common';
import HedgeTabOptimism from './HedgeTabOptimism';
import SellHedgeTabOptimism from './SellHedgeTabOptimism';

export default function HedgeOptimismTabs() {
	const [activeTab, setActiveTab] = useState('buy');

	return (
		<>
			<StyledTabsContainer>
				<StyledTabButton
					active={activeTab === 'buy'}
					onClick={() => setActiveTab('buy')}
					name="buy"
				>
					BUY
				</StyledTabButton>
				<StyledTabButton
					active={activeTab === 'sell'}
					onClick={() => setActiveTab('sell')}
					name="sell"
				>
					SELL
				</StyledTabButton>
			</StyledTabsContainer>
			{activeTab === 'buy' ? <HedgeTabOptimism /> : <SellHedgeTabOptimism />}
		</>
	);
}

const StyledTabButton = styled(TabButton)`
	width: 100%;
`;
const StyledTabsContainer = styled(FlexDivJustifyCenter)`
	width: 100%;
	height: 100%;
`;
