import { TabButton } from 'components/Tab';
import { useState } from 'react';
import styled from 'styled-components';
import { FlexDivJustifyCenter } from 'styles/common';
import BuyHedgeTabOptimism from './BuyHedgeTabOptimism';
import SellHedgeTabOptimism from './SellHedgeTabOptimism';

export default function HedgeOptimismTabs() {
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <StyledContainer>
      <FlexDivJustifyCenter>
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
      </FlexDivJustifyCenter>
      {activeTab === 'buy' ? <BuyHedgeTabOptimism /> : <SellHedgeTabOptimism />}
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledTabButton = styled(TabButton)`
  width: 100%;
`;
