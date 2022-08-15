import React from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, YAxis, Line, LineChart, XAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { FlexDivCol, FlexDivColCentered } from 'styles/common';
import useGlobalHistoricalDebtData from 'hooks/useGlobalHistoricalDebtData';
import colors from 'styles/theme/colors';
import SpinnerIcon from 'assets/svg/app/loader.svg';
import ChartLabel from './ChartLabel';
import { format } from 'date-fns';
import fonts from 'styles/theme/fonts';
import DebtHedgedBalance from './DebtHedgedBalance';

const DebtHedgingChart: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGlobalHistoricalDebtData();

  if (isLoading) {
    return (
      <SpinnerContainer>
        <Spinner width="38" />
      </SpinnerContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitleContainer>
        <StyledTitle>{t('debt.actions.manage.info-panel.chart.title')}</StyledTitle>
        <StyledChartLabelsWrapper>
          <ChartLabel labelColor={colors.mutedBlue} labelBorderColor={colors.blue}>
            {t('debt.actions.manage.info-panel.chart.debt-mirror-label')}
          </ChartLabel>
          <ChartLabel labelColor={colors.mutedPink} labelBorderColor={colors.pink}>
            {t('debt.actions.manage.info-panel.chart.debtPool-label')}
          </ChartLabel>
        </StyledChartLabelsWrapper>
        <DebtHedgedBalance />
      </ChartTitleContainer>
      <ResponsiveContainer width="100%" height={270}>
        <LineChart margin={{ left: 0, top: 20, bottom: 0, right: 0 }} data={data}>
          <YAxis width={0} domain={['auto', 'auto']} tickLine={false} />
          <XAxis
            height={30}
            dataKey="debtPool.timestamp"
            interval="preserveEnd"
            tick={{ fontSize: 10, fill: colors.white, fontFamily: fonts.mono }}
            tickLine={false}
            tickFormatter={(tick) => format(new Date(tick * 1000), 'd MMM yy').toUpperCase()}
          />
          <Line
            type="monotone"
            dataKey="mirrorPool.value"
            stroke={colors.blue}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="debtPool.value"
            stroke={colors.pink}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const ChartContainer = styled(FlexDivColCentered)`
  height: 100%;
  width: 100%;
`;

const ChartTitleContainer = styled(FlexDivCol)`
  border-top: 1px solid ${(props) => props.theme.colors.mediumBlue};
  border-bottom: 1px solid ${(props) => props.theme.colors.mediumBlue};
  font-family: ${(props) => props.theme.fonts.extended};
  width: 100%;
  font-size: 13px;
  padding-left: 30px;
  padding-right: 30px;
`;

const SpinnerContainer = styled(FlexDivColCentered)`
  height: 100%;
  justify-content: center;
`;

const Spinner = styled(SpinnerIcon)`
  display: block;
  margin: 30px auto;
`;

const StyledChartLabelsWrapper = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-evenly;
`;

const StyledTitle = styled.p`
  font-size: 13px;
`;

export default DebtHedgingChart;
