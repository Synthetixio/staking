import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTheme } from 'styled-components';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

import Connector from 'containers/Connector';
import { FlexDivColCentered } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from 'constants/currency';

import SpinnerIcon from 'assets/svg/app/loader.svg';
import Wei from '@synthetixio/wei';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';

const LEGEND_LABELS = {
  actualDebt: 'debt.actions.track.chart.tooltip.actualDebt',
  issuanceDebt: 'debt.actions.track.chart.tooltip.issuedDebt',
};

type Payload = {
  color: string;
  name: keyof typeof LEGEND_LABELS;
  value: Wei;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload[];
  label?: Date;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const { t } = useTranslation();
  if (!active || !label) return null;

  return (
    <TooltipWrapper>
      <StyledH5>{format(new Date(label), 'MMM dd YYY, h:mma')}</StyledH5>
      <Legend>
        {payload?.map(({ color, name, value }) => {
          return (
            <LegendRow key={`legend-${name}`}>
              <LegendName>
                <LegendIcon style={{ backgroundColor: color }} />
                <LegendText>{t(LEGEND_LABELS[name])}</LegendText>
              </LegendName>
              <LegendText>{`${formatCurrency(Synths.sUSD, value)} sUSD`}</LegendText>
            </LegendRow>
          );
        })}
      </Legend>
    </TooltipWrapper>
  );
};

type Data = {
  timestamp: number;
  issuanceDebt: Wei;
  actualDebt: Wei;
};

const DebtChart = ({ data, isLoading }: { data: Data[]; isLoading: boolean }) => {
  const { t } = useTranslation();
  const { colors, fonts } = useTheme();
  const { isWalletConnected } = Connector.useContainer();

  if (!isWalletConnected) {
    return <ConnectOrSwitchNetwork />;
  }

  if (isLoading) {
    return (
      <DefaultContainer>
        <Spinner width="38" />
      </DefaultContainer>
    );
  }
  if (!data || data.length === 0)
    return <DefaultContainer>{t('debt.actions.track.no-data')}</DefaultContainer>;

  const parsedData = data.map((p) => ({
    timestamp: p.timestamp,
    issuanceDebt: p.issuanceDebt ? p.issuanceDebt.toNumber() : 0,
    actualDebt: p.actualDebt ? p.actualDebt.toNumber() : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart margin={{ left: 10, top: 20, bottom: 0, right: 5 }} data={parsedData}>
        <XAxis
          height={20}
          dataKey="timestamp"
          interval="preserveEnd"
          tick={{ fontSize: 8, fill: colors.white, fontFamily: fonts.regular }}
          tickLine={false}
          tickFormatter={(tick) => format(new Date(tick), 'd MMM yy')}
        />
        <YAxis
          width={35}
          axisLine={{ stroke: colors.white, strokeWidth: 1 }}
          domain={['auto', 'auto']}
          tickLine={false}
          // @ts-ignore
          tickFormatter={(tick) => Intl.NumberFormat('en', { notation: 'compact' }).format(tick)}
          tick={{ fontSize: 12, fill: colors.white, fontFamily: fonts.interSemiBold }}
        />
        <Tooltip
          cursor={{ stroke: colors.white, strokeDasharray: 2 }}
          content={<CustomTooltip />}
          contentStyle={{
            opacity: 1,
            backgroundColor: colors.navy,
            zIndex: 1000,
            borderColor: colors.navy,
          }}
        />
        <Line
          type="monotone"
          dataKey="issuanceDebt"
          stroke={colors.blue}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="actualDebt"
          stroke={colors.pink}
          strokeWidth={2}
          dot={false}
        />
        <ReferenceLine y={0} isFront={false} strokeWidth={1} stroke={colors.grayBlue} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const TooltipWrapper = styled.div`
  width: 250px;
  background-color: ${(props) => props.theme.colors.grayBlue};
  border: 1px solid ${(props) => props.theme.colors.grayBlue};
  border-radius: 2px;
  padding: 0 16px 16px 16px;
  text-align: left;
`;

const StyledH5 = styled.h5`
  font-size: 14px;
  text-transform: none;
`;

const Legend = styled.div`
  width: 100%;
`;

const LegendRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const LegendName = styled.div`
  display: flex;
  align-items: center;
`;

const LegendIcon = styled.div`
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  margin-right: 8px;
`;

const LegendText = styled.span`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
`;

const DefaultContainer = styled(FlexDivColCentered)`
  height: 270px;
  justify-content: center;
`;

const Spinner = styled(SpinnerIcon)`
  display: block;
  margin: 30px auto;
`;

export default DebtChart;
