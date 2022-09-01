import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps, Row } from 'react-table';
import styled, { css } from 'styled-components';
import Countdown from 'react-countdown';
import { useRouter } from 'next/router';

import Connector from 'containers/Connector';
import Currency from 'components/Currency';

import ProgressBar from 'components/ProgressBar';
import Table from 'components/Table';

import ExpandIcon from 'assets/svg/app/expand.svg';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { formatPercent, formatFiatCurrency, formatCurrency } from 'utils/formatters/number';

import { FlexDivCol, GlowingCircle, IconButton, TableNoResults } from 'styles/common';
import { CryptoCurrency, CurrencyKey } from 'constants/currency';
import { DURATION_SEPARATOR } from 'constants/date';

import ROUTES from 'constants/routes';

import { LP, Tab } from './types';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';
import Wei, { wei } from '@synthetixio/wei';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';

export type DualRewards = {
  a: Wei;
  b: Wei;
};

export const NOT_APPLICABLE = 'n/a';

export type EarnItem = {
  title: string;
  subtitle: string;
  apr?: Wei;
  tvl?: Wei;
  staked: {
    balance?: Wei;
    asset: CurrencyKey;
    ticker: CurrencyKey;
    type?: CurrencyIconType;
  };
  rewards?: Wei | DualRewards;
  periodStarted: number;
  periodFinish: number;
  claimed: boolean | string;
  now: number;
  tab: Tab;
  route: string;
  externalLink?: string;
  dualRewards?: boolean;
  neverExpires?: boolean;
};

type IncentivesTableProps = {
  data: EarnItem[];
  isLoaded: boolean;
  activeTab: Tab | null;
};

const IncentivesTable: FC<IncentivesTableProps> = ({ data, isLoaded, activeTab }) => {
  const { t } = useTranslation();
  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
  const router = useRouter();
  const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

  const leftColumns = useMemo(() => {
    return [
      {
        Header: <>{t('earn.incentives.options.select-a-pool.title')}</>,
        accessor: 'title',
        Cell: (cellProps: CellProps<EarnItem>) => {
          const iconProps = {
            width: '22',
            height: '22',
          };
          return (
            <>
              <StyledGlowingCircle variant="green" size="sm">
                <Currency.Icon
                  currencyKey={cellProps.row.original.staked.asset}
                  type={
                    cellProps.row.original.staked.type
                      ? cellProps.row.original.staked.type
                      : undefined
                  }
                  {...iconProps}
                />
              </StyledGlowingCircle>
              <FlexDivCol>
                <Title>{cellProps.row.original.title}</Title>
                <Subtitle>{cellProps.row.original.subtitle}</Subtitle>
              </FlexDivCol>
            </>
          );
        },
        width: 175,
        sortable: false,
      },
      {
        Header: (
          <CellContainer>
            {activeTab == null ? (
              <>{t('earn.incentives.est-apr')}</>
            ) : (
              <StyledIconButton onClick={goToEarn}>
                <ExpandIcon width="24" />
              </StyledIconButton>
            )}
          </CellContainer>
        ),
        accessor: 'apr',
        Cell: (cellProps: CellProps<EarnItem>) => {
          if (!cellProps.row.original.apr) return <CellContainer>-</CellContainer>;
          return (
            <CellContainer>
              <Title isNumeric={true}>{formatPercent(cellProps.row.original.apr)}</Title>
              <Subtitle>{t('earn.incentives.est-apr')}</Subtitle>
            </CellContainer>
          );
        },
        width: 100,
        sortable: false,
      },
    ];
  }, [t, goToEarn, activeTab]);

  const rightColumns = useMemo(() => {
    return [
      {
        Header: <>{t('earn.incentives.options.staked-balance.title')}</>,
        accessor: 'staked.balance',
        Cell: (cellProps: CellProps<EarnItem, EarnItem['staked']['balance']>) => {
          if (cellProps.row.original.staked.balance === undefined) return '-';
          return (
            <CellContainer>
              <Title isNumeric={true}>
                {formatCurrency(
                  cellProps.row.original.staked.ticker,
                  cellProps.row.original.staked.balance,
                  {
                    currencyKey: cellProps.row.original.staked.ticker,
                  }
                )}
              </Title>
              <Subtitle />
            </CellContainer>
          );
        },
        width: 150,
        sortable: true,
      },
      {
        Header: <>{t('earn.incentives.options.tvl.title')}</>,
        accessor: 'tvl',
        Cell: (cellProps: CellProps<EarnItem, EarnItem['tvl']>) => (
          <CellContainer>
            <Title isNumeric={true}>
              {formatFiatCurrency(getPriceAtCurrentRate(wei(cellProps.value || 0)), {
                sign: selectedPriceCurrency.sign,
              })}
            </Title>
          </CellContainer>
        ),
        width: 150,
        sortable: true,
      },

      {
        Header: <>{t('earn.incentives.options.rewards.title')}</>,
        accessor: 'rewards',
        Cell: (cellProps: CellProps<EarnItem, EarnItem['rewards']>) => {
          if (!cellProps.row.original.rewards) {
            return '-';
          }
          const isDualRewards = cellProps.row.original.dualRewards;
          if (
            !cellProps.row.original.externalLink ||
            cellProps.row.original.staked.asset !== LP.CURVE_sUSD
          ) {
            return (
              <CellContainer>
                <Title isNumeric={true}>
                  {formatCurrency(
                    CryptoCurrency.SNX,
                    (isDualRewards ? (cellProps.value as DualRewards).a : cellProps.value) as Wei,
                    {
                      currencyKey: CryptoCurrency.SNX,
                    }
                  )}
                </Title>
                {isDualRewards && (
                  <Title isNumeric={true}>
                    {formatCurrency(CryptoCurrency.DHT, (cellProps.value as DualRewards).b, {
                      currencyKey: CryptoCurrency.DHT,
                    })}
                  </Title>
                )}
                <Subtitle>
                  {cellProps.row.original.claimed === NOT_APPLICABLE ||
                  (!cellProps.row.original.claimed &&
                    !isDualRewards &&
                    (cellProps.row.original.rewards as Wei).eq(0)) ? (
                    ''
                  ) : cellProps.row.original.claimed ? (
                    t('earn.incentives.options.rewards.claimed')
                  ) : (
                    <Claimable>{t('earn.incentives.options.rewards.claimable')}</Claimable>
                  )}
                </Subtitle>
              </CellContainer>
            );
          } else {
            return <p>{t('earn.incentives.options.curve.helper')}</p>;
          }
        },
        width: 150,
        sortable: true,
      },
      {
        Header: <>{t('earn.incentives.options.time-left.title')}</>,
        accessor: 'periodFinish',
        Cell: (cellProps: CellProps<EarnItem, EarnItem['periodFinish']>) => {
          if (cellProps.row.original.neverExpires) {
            return <Subtitle>{t('earn.incentives.options.time-left.does-not-expire')}</Subtitle>;
          }
          return (
            <CellContainer style={{ width: '100%' }}>
              <StyledProgressBar
                percentage={
                  (cellProps.row.original.now - cellProps.row.original.periodStarted) /
                  (cellProps.row.original.periodFinish - cellProps.row.original.periodStarted)
                }
                variant="rainbow"
              />
              <Subtitle>
                <Countdown
                  date={cellProps.value}
                  renderer={({ days, hours, minutes, seconds }) => {
                    const duration = [
                      `${days}${t('common.time.days')}`,
                      `${hours}${t('common.time.hours')}`,
                      `${minutes}${t('common.time.minutes')}`,
                      `${seconds}${t('common.time.seconds')}`,
                    ];

                    return <span>{duration.join(DURATION_SEPARATOR)}</span>;
                  }}
                />
              </Subtitle>
            </CellContainer>
          );
        },
        width: 120,
        sortable: true,
      },
    ];
  }, [getPriceAtCurrentRate, selectedPriceCurrency.sign, t]);

  const columns = useMemo(() => {
    return activeTab != null ? leftColumns : [...leftColumns, ...rightColumns];
  }, [activeTab, leftColumns, rightColumns]);

  return (
    <Container activeTab={activeTab}>
      <DesktopOrTabletView>
        <IncentivesInnerTable {...{ columns, data, isLoaded, activeTab }} />
      </DesktopOrTabletView>
      <MobileOnlyView>
        <IncentivesInnerTable
          /* @ts-ignore TODO: replace with chakra table */
          columns={leftColumns}
          {...{ data, isLoaded, activeTab }}
        />
      </MobileOnlyView>
    </Container>
  );
};

type IncentivesInnerTableProps = {
  columns: any[];
  data: EarnItem[];
  isLoaded: boolean;
  activeTab: Tab | null;
};

const IncentivesInnerTable: FC<IncentivesInnerTableProps> = ({
  columns,
  data,
  isLoaded,
  activeTab,
}) => {
  const { isWalletConnected } = Connector.useContainer();
  const router = useRouter();

  return (
    <StyledTable
      palette="primary"
      {...{ columns, data }}
      data={data}
      isLoading={isWalletConnected && !isLoaded}
      showPagination={true}
      onTableRowClick={(row: Row<EarnItem>) => {
        if (row.original.externalLink) {
          window.open(row.original.externalLink, '_blank');
        } else {
          router.push(row.original.route);
        }
      }}
      isActiveRow={(row: Row<EarnItem>) => row.original.tab === activeTab}
      noResultsMessage={
        !isWalletConnected ? (
          <TableNoResults>
            <ConnectOrSwitchNetwork />
          </TableNoResults>
        ) : undefined
      }
    />
  );
};

const Container = styled.div<{ activeTab: Tab | null }>`
  background: ${(props) => props.theme.colors.navy};
  width: 100%;
  ${(props) =>
    props.activeTab &&
    css`
      .table-header-cell {
        &:last-child {
          padding-right: 0;
        }
      }
    `}
`;

const StyledProgressBar = styled(ProgressBar)`
  margin-bottom: 5px;
`;

const CellContainer = styled(FlexDivCol)`
  width: 100%;
`;

const StyledTable = styled(Table)`
  .table-body {
    max-height: 400px;
  }
  .table-body-row {
    height: 70px;
    align-items: center;
    border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
    &:hover {
      background-color: ${(props) => props.theme.colors.mediumBlue};
    }
    &.active-row {
      border-right: 1px solid ${(props) => props.theme.colors.blue};
    }
  }
  .table-body-cell {
    &:first-child {
    }
    &:last-child {
      padding-left: 0;
    }
  }
`;

const Title = styled.div<{ isNumeric?: boolean }>`
  font-family: ${(props) =>
    props.isNumeric ? props.theme.fonts.mono : props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.white};
`;

const Subtitle = styled.div`
  color: ${(props) => props.theme.colors.gray};
  padding-top: 1px;
`;

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
  svg {
    color: ${(props) => props.theme.colors.gray};
  }
  &:hover {
    svg {
      color: ${(props) => props.theme.colors.white};
    }
  }
`;

const Claimable = styled.span`
  color: ${(props) => props.theme.colors.green};
`;

const StyledGlowingCircle = styled(GlowingCircle)`
  margin-right: 12px;
`;

export default IncentivesTable;
