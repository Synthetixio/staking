import { FC, useState, useMemo } from 'react';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import formatDate from 'date-fns/format';

import { formatCurrency } from 'utils/formatters/number';
import ArrowForwardPink from 'assets/svg/app/arrow-forward-pink.svg';
import useHistoricalDebtData, { HistoricalDebtAndIssuanceData } from 'hooks/useHistoricalDebtData';
import { CenteredModal } from '../common';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

const INITIAL_SNAPSHOT: HistoricalDebtAndIssuanceData = {
  timestamp: 0,
  actualDebt: wei(0),
  issuanceDebt: wei(0),
  index: 0,
};

export const DebtValueModal: FC<{ value: string; isOpened: boolean; onDismiss: () => void }> = ({
  value,
  isOpened,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const chartColor = colors.pink;
  const linearGradientId = '#colorPink';

  const { walletAddress } = Connector.useContainer();
  const historicalDebt = useHistoricalDebtData(walletAddress);

  const data = useMemo(() => historicalDebt.data ?? [], [historicalDebt]);

  const [currentSnapshot, setCurrentSnapshot] = useState<HistoricalDebtAndIssuanceData | null>(
    null
  );
  const currentSnapshotOrLast = useMemo(
    () => (!(data.length && currentSnapshot) ? data[data.length - 1] : currentSnapshot),
    [data, currentSnapshot]
  );
  const prevSnapshot = useMemo(
    () =>
      !(data.length && currentSnapshotOrLast)
        ? null
        : currentSnapshotOrLast.index === 0
        ? INITIAL_SNAPSHOT
        : data[currentSnapshotOrLast.index - 1],
    [data, currentSnapshotOrLast]
  );

  return (
    <StyledMenuModal onDismiss={onDismiss} isOpen={isOpened} title={t('modals.debt-value.title')}>
      <Title>{value}</Title>

      <AreaChartContainer>
        <AreaChart
          width={383}
          height={94}
          data={data}
          id={'debt-value-chart'}
          onMouseMove={(e: any) => {
            const currentRate = get(e, 'activePayload[0].payload', null);
            if (currentRate) {
              setCurrentSnapshot(currentRate);
            } else {
              setCurrentSnapshot(null);
            }
          }}
          onMouseLeave={() => {
            setCurrentSnapshot(null);
          }}
        >
          <defs>
            <linearGradient id={linearGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.5} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            type="number"
            dataKey="timestamp"
            domain={['dataMin', 'dataMax']}
            hide
            axisLine={false}
            tickLine={false}
            allowDataOverflow={true}
          />
          <YAxis
            type="number"
            allowDataOverflow={true}
            domain={['dataMin', 'dataMax']}
            hide
            axisLine={false}
            tickLine={false}
          />

          <Area
            dataKey="actualDebt"
            stroke={chartColor}
            dot={false}
            strokeWidth={2}
            fill={`url(#${linearGradientId})`}
            isAnimationActive={false}
          />

          <Tooltip
            isAnimationActive={false}
            position={{
              y: 0,
            }}
            content={
              // @ts-ignore
              <CustomTooltip />
            }
          />
        </AreaChart>
      </AreaChartContainer>

      {!(currentSnapshotOrLast && prevSnapshot) ? null : (
        <Footer>
          <FooterItem>
            {t('modals.debt-value.issued-debt')}
            <FooterItemChange>
              <div>
                {formatCurrency('sUSD', prevSnapshot.issuanceDebt, {
                  sign: '$',
                })}
              </div>
              <ArrowForwardPink width="12" />
              <div>
                {' '}
                {formatCurrency('sUSD', currentSnapshotOrLast.issuanceDebt, {
                  sign: '$',
                })}
              </div>
            </FooterItemChange>
          </FooterItem>
          <FooterItem>
            {t('modals.debt-value.actual-debt')}
            <FooterItemChange>
              <div>
                {formatCurrency('sUSD', prevSnapshot.actualDebt, {
                  sign: '$',
                })}
              </div>
              <ArrowForwardPink width="12" />
              <div>
                {' '}
                {formatCurrency('sUSD', currentSnapshotOrLast.actualDebt, {
                  sign: '$',
                })}
              </div>
            </FooterItemChange>
          </FooterItem>
          <FooterItem>
            {t('modals.debt-value.share-of-debt-pool')}
            <FooterItemChange>
              <span>0%</span>
              <ArrowForwardPink width="12" />
              <span>0%</span>
            </FooterItemChange>
          </FooterItem>
        </Footer>
      )}
    </StyledMenuModal>
  );
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active: boolean;
  payload: [
    {
      value: number;
      payload: {
        timestamp: number;
        actualDebt: number;
      };
    }
  ];
  label: Date;
}) => {
  if (!(active && payload && payload[0])) return null;
  const {
    payload: { timestamp, actualDebt },
  } = payload[0];
  return (
    <TooltipContentStyle>
      <LabelStyle>{formatDate(new Date(timestamp), 'MMM d yyyy')}</LabelStyle>
      <LabelStyle orange>
        DEBT:{' '}
        {formatCurrency('sUSD', actualDebt, {
          sign: '$',
        })}
      </LabelStyle>
    </TooltipContentStyle>
  );
};

const StyledMenuModal = styled(CenteredModal)`
  [data-reach-dialog-content] {
    width: 447px;
    height: 456px;
  }
  .card-body {
    padding: 32px;
  }
`;

const Title = styled.div`
  font-size: 24px;
  font-family: ${(props) => props.theme.fonts.extended};
  text-align: center;
  margin: 0 0 24px;
`;

const AreaChartContainer = styled.div`
  margin: 0 auto;
`;

const Footer = styled.div`
  margin-top: 44px;
`;

const FooterItem = styled.div`
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.condensedBold};
  color: ${(props) => props.theme.colors.gray};
  padding: 8px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};

  span {
    color: ${(props) => props.theme.colors.white};
  }
`;

const FooterItemChange = styled.div`
  display: flex;
  grid-gap: 10px;
`;

const TooltipContentStyle = styled.div`
  font-family: ${(props) => props.theme.fonts.condensedBold};
  font-size: 12px;
  padding: 5px;
  border-radius: 4px;
  background-color: #4f5973;
  text-align: center;
`;

const LabelStyle = styled.div<{ orange?: boolean }>`
  color: ${(props) => (props.orange ? props.theme.colors.orange : props.theme.colors.white)};
  padding: 3px 5px;
  text-transform: capitalize;
`;

export default DebtValueModal;
