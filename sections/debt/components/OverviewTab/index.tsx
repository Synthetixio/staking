import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import DebtChart from '../DebtChart';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';
import { FlexDivCol, FlexDiv, Tooltip } from 'styles/common';

import Connector from 'containers/Connector';
import Info from 'assets/svg/app/info.svg';

const OverviewTab = () => {
  const { t } = useTranslation();

  const { walletAddress } = Connector.useContainer();

  const historicalDebt = useHistoricalDebtData(walletAddress);

  return (
    <>
      <Container>
        <ContainerHeader>
          <ContainerHeaderSection>
            {t('debt.actions.track.chart.title')}
            <DebtInfoTooltip
              arrow={false}
              content={
                <Trans
                  i18nKey="debt.actions.track.info.tooltip"
                  components={[<Strong />, <br />, <Strong />]}
                ></Trans>
              }
            >
              <TooltipIconContainer>
                <Info width="16" />
              </TooltipIconContainer>
            </DebtInfoTooltip>
          </ContainerHeaderSection>
        </ContainerHeader>
        <ContainerBody>
          <DebtChart data={historicalDebt.data} isLoading={historicalDebt.isLoading} />
        </ContainerBody>
      </Container>
    </>
  );
};

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

const Strong = styled.strong`
  font-family: ${(props) => props.theme.fonts.interBold};
`;

export default OverviewTab;
