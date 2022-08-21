import styled from 'styled-components';
import React, { FC, ReactNode, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { FlexDiv, FlexDivCol, Tooltip } from 'styles/common';
import media from 'styles/media';
import { TabButton, TabList, TabPanelContainer } from '../../../../components/Tab';
import DebtHedgingInfoPanel from '../DebtHedgingInfoPanel';
import DebtPieChart from '../DebtPieChart';
import PortfolioTable from '../PortfolioTable';

import { DebtPanelType } from 'store/debt';
import useCryptoBalances from 'hooks/useCryptoBalances';

import Info from 'assets/svg/app/info.svg';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

export type TabInfo = {
  title: string;
  icon?: ReactNode;
  tabChildren: ReactNode;
  key: string;
  disabled?: boolean;
  width?: number;
};

type DebtTabsProps = {
  tabData: TabInfo[];
  boxHeight?: number;
  boxWidth: number;
  boxPadding: number;
  tabHeight?: number;
  currentPanel?: string;
  setPanelType?: Dispatch<SetStateAction<any>>;
};

const DebtTabs: FC<DebtTabsProps> = ({
  tabData,
  boxHeight,
  boxPadding,
  tabHeight,
  currentPanel,
  setPanelType,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>(currentPanel ? currentPanel : tabData[0].key);

  useEffect(() => {
    if (currentPanel) {
      setActiveTab(currentPanel);
    }
  }, [currentPanel]);

  const { walletAddress, isMainnet } = Connector.useContainer();

  const { useSynthsBalancesQuery /*useSynthsTotalSupplyQuery*/ } = useSynthetixQueries();

  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
  const synthBalances =
    synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
      ? synthsBalancesQuery.data
      : null;
  const synthAssets = synthBalances?.balances ?? [];
  const cryptoBalances = useCryptoBalances(walletAddress);

  const totalSynthValue = synthsBalancesQuery.isSuccess
    ? synthsBalancesQuery.data?.totalUSDBalance ?? wei(0)
    : wei(0);

  // const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
  // const totalSupply = synthsTotalSupplyQuery?.data;
  const totalSupply = undefined;

  const isManageTab = activeTab === DebtPanelType.MANAGE;
  return (
    <>
      {
        <TopContainer isManageTab={isManageTab} isMainnet={isMainnet}>
          <DebtTabsContainer>
            <TabList noOfTabs={tabData.length}>
              {tabData.map(({ title, icon, key, disabled = false }, index) => (
                <TabButton
                  isSingle={false}
                  tabHeight={tabHeight}
                  key={`${key}-${index}-button`}
                  name={title}
                  active={activeTab === key}
                  isDisabled={disabled}
                  onClick={() => {
                    setActiveTab(key);
                    if (setPanelType != null) {
                      setPanelType(key);
                    }
                  }}
                >
                  {icon != null && icon}
                  <TitleContainer>{title}</TitleContainer>
                </TabButton>
              ))}
            </TabList>

            {tabData.map(
              ({ title, tabChildren, key }, index) =>
                activeTab === key && (
                  <TabPanelContainer
                    id={`${title}-tabpanel`}
                    role="tabpanel"
                    aria-labelledby={`${title}-tab`}
                    tabIndex={-1}
                    padding={boxPadding}
                    height={boxHeight}
                    key={`${key}-${index}-panel`}
                  >
                    {tabChildren}
                  </TabPanelContainer>
                )
            )}
          </DebtTabsContainer>
          <DebtHedgingInfoPanel hidden={!isManageTab} />
        </TopContainer>
      }
      {activeTab === DebtPanelType.OVERVIEW && (
        <>
          <BottomContainer>
            <DebtPieChartContainer>
              <ContainerHeader>
                {t('debt.actions.hedge.info.debt-pool-pie-chart.title')}
              </ContainerHeader>
              <ContainerBody style={{ padding: '24px 0' }}>
                <DebtPieChart data={totalSupply} isLoaded={true} isLoading={false} />
              </ContainerBody>
            </DebtPieChartContainer>
            <PortfolioContainer>
              <ContainerHeader>
                <ContainerHeaderSection>
                  <span>{t('debt.actions.hedge.info.portfolio-table.title')}</span>
                  <DebtInfoTooltip
                    arrow={false}
                    content={
                      <Trans
                        i18nKey="debt.actions.hedge.info.tooltip"
                        components={[<Strong />]}
                      ></Trans>
                    }
                  >
                    <TooltipIconContainer>
                      <Info width="16" />
                    </TooltipIconContainer>
                  </DebtInfoTooltip>
                </ContainerHeaderSection>
              </ContainerHeader>
              <ContainerBody style={{ padding: '24px 14px' }}>
                <PortfolioTable
                  synthBalances={synthAssets}
                  cryptoBalances={cryptoBalances.balances}
                  synthsTotalSupply={totalSupply}
                  isLoading={synthsBalancesQuery.isLoading}
                  isLoaded={synthsBalancesQuery.isSuccess}
                  synthsTotalValue={totalSynthValue ?? wei(0)}
                />
              </ContainerBody>
            </PortfolioContainer>
          </BottomContainer>
        </>
      )}
    </>
  );
};

export const TopContainer = styled.div<{ isManageTab: boolean; isMainnet: boolean }>`
  ${(props) =>
    props.isManageTab && !props.isMainnet
      ? `display: grid;
          grid-template-columns: 2fr 1fr;
          grid-gap: 1rem;`
      : ''}
  margin-bottom: 12px;

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

export const BottomContainer = styled.div`
  display: flex;
  gap: 1rem;

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

const DebtTabsContainer = styled(FlexDivCol)`
  width: 100%;
`;

const TitleContainer = styled.p`
  margin-left: 8px;
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.extended};
  text-transform: uppercase;
`;

const Container = styled(FlexDivCol)`
  background: ${(props) => props.theme.colors.navy};
`;

const ContainerHeader = styled(FlexDiv)`
  width: 100%;
  padding: 14px 24px;
  border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
  font-family: ${(props) => props.theme.fonts.extended};
  text-transform: uppercase;
  font-size: 12px;
  align-items: center;
  justify-content: space-between;
`;

const ContainerHeaderSection = styled(FlexDiv)``;

const ContainerBody = styled.div`
  padding: 24px;
`;

const DebtInfoTooltip = styled(Tooltip)`
  background: ${(props) => props.theme.colors.navy};
  .tippy-arrow {
    color: ${(props) => props.theme.colors.navy};
  }
  .tippy-content {
    font-size: 14px;
  }
`;

const TooltipIconContainer = styled(FlexDiv)`
  margin-left: 10px;
  opacity: 0.6;
  align-items: center;
`;

const DebtPieChartContainer = styled(Container)`
  width: 60%;
  ${media.lessThan('mdUp')`
    width: 100%;
  `};
`;

const PortfolioContainer = styled(Container)`
  align-self: flex-start;
  flex: 1;
  ${media.lessThan('mdUp')`
    width: 100%;
  `};
`;

const Strong = styled.strong`
  font-family: ${(props) => props.theme.fonts.interBold};
`;

export default DebtTabs;
