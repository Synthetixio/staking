import React, { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';

import { TableNoResults, TableNoResultsTitle, FlexDiv, Tooltip } from 'styles/common';
import media from 'styles/media';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';
import SynthHolding from 'components/SynthHolding';

import { ProgressBarType } from 'components/ProgressBar/ProgressBar';

import Connector from 'containers/Connector';
import { CryptoCurrency, Synths } from 'constants/currency';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';

import Info from 'assets/svg/app/info.svg';
import { CryptoBalance } from 'hooks/useCryptoBalances';
import { SynthsTotalSupplyData } from '@synthetixio/queries';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';

const SHOW_HEDGING_INDICATOR_THRESHOLD = wei(0.1);

type DebtPoolTableProps = {
  synthBalances: CryptoBalance[];
  cryptoBalances: CryptoBalance[];
  synthsTotalSupply?: SynthsTotalSupplyData;
  synthsTotalValue: Wei;
  isLoading: boolean;
  isLoaded: boolean;
};

const DebtPoolTable: React.FC<DebtPoolTableProps> = (props) => {
  return (
    <>
      <DesktopOrTabletView>
        <ResponsiveDebtPoolTable {...props} />
      </DesktopOrTabletView>
      <MobileOnlyView>
        <ResponsiveDebtPoolTable {...props} mobile />
      </MobileOnlyView>
    </>
  );
};

type ResponsiveDebtPoolTableProps = {
  synthBalances: CryptoBalance[];
  cryptoBalances: CryptoBalance[];
  synthsTotalSupply?: SynthsTotalSupplyData;
  synthsTotalValue: Wei;
  isLoading: boolean;
  isLoaded: boolean;
  mobile?: boolean;
};

const ResponsiveDebtPoolTable: FC<ResponsiveDebtPoolTableProps> = ({
  synthBalances,
  cryptoBalances,
  synthsTotalSupply,
  synthsTotalValue,
  isLoading,
  isLoaded,
  mobile,
}) => {
  const { t } = useTranslation();

  const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
  const { isAppReady, isWalletConnected } = Connector.useContainer();

  const [renBTCBalance, wBTCBalance, wETHBalance, ETHBalance] = useMemo(
    () => [
      cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.RENBTC),
      cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.WBTC),
      cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.WETH),
      cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.ETH),
    ],
    [cryptoBalances]
  );

  const mergedTotalValue = useMemo(
    () =>
      [renBTCBalance, wBTCBalance, wETHBalance, ETHBalance].reduce((total, current) => {
        const usdValue = current?.usdBalance ?? wei(0);
        return total.add(usdValue);
      }, synthsTotalValue),
    [ETHBalance, renBTCBalance, wBTCBalance, wETHBalance, synthsTotalValue]
  );

  const mergedBTCBalances = useMemo((): CryptoBalance => {
    const sBTCBalance = synthBalances.find(
      (synthBalance) => synthBalance.currencyKey === Synths.sBTC
    );

    const sBTCAmount = sBTCBalance?.balance ?? wei(0);
    const sBTCUSDAmount = sBTCBalance?.usdBalance ?? wei(0);
    const renBTCAmount = renBTCBalance?.balance ?? wei(0);
    const renBTCUSDAmount = renBTCBalance?.usdBalance ?? wei(0);
    const wBTCAmount = wBTCBalance?.balance ?? wei(0);
    const wBTCUSDAmount = wBTCBalance?.usdBalance ?? wei(0);

    return {
      currencyKey: Synths.sBTC,
      balance: sBTCAmount.add(renBTCAmount).add(wBTCAmount),
      usdBalance: sBTCUSDAmount.add(renBTCUSDAmount).add(wBTCUSDAmount),
    };
  }, [synthBalances, renBTCBalance, wBTCBalance]);

  const mergedETHBalances = useMemo((): CryptoBalance => {
    const sETHBalance = synthBalances.find(
      (synthBalance) => synthBalance.currencyKey === Synths.sETH
    );

    const sETHAmount = sETHBalance?.balance ?? wei(0);
    const sETHUSDAmount = sETHBalance?.usdBalance ?? wei(0);
    const ETHAmount = ETHBalance?.balance ?? wei(0);
    const ETHUSDAmount = ETHBalance?.usdBalance ?? wei(0);
    const wETHAmount = wETHBalance?.balance ?? wei(0);
    const wETHUSDAmount = wETHBalance?.usdBalance ?? wei(0);

    return {
      currencyKey: Synths.sETH,
      balance: sETHAmount.add(ETHAmount).add(wETHAmount),
      usdBalance: sETHUSDAmount.add(ETHUSDAmount).add(wETHUSDAmount),
    };
  }, [synthBalances, ETHBalance, wETHBalance]);

  // Replace sETH and sBTC entries with the combined balances of all ETH-related and BTC-related assets
  const mergedBalances = useMemo(
    () =>
      synthBalances
        .filter(({ currencyKey }) => currencyKey !== Synths.sETH && currencyKey !== Synths.sBTC)
        .concat([mergedETHBalances, mergedBTCBalances])
        .filter(({ balance }) => balance.gt(wei(0))),
    [synthBalances, mergedBTCBalances, mergedETHBalances]
  );

  const assetColumns = useMemo(() => {
    if (!isAppReady) {
      return [];
    }

    const columns = [
      {
        Header: <>{t('synths.assets.synths.table.asset')}</>,
        accessor: 'currencyKey',
        Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['currencyKey']>) => {
          let displayName = cellProps.value;
          if (cellProps.value === Synths.sETH) {
            displayName = CryptoCurrency.ETH;
          } else if (cellProps.value === Synths.sBTC) {
            displayName = CryptoCurrency.BTC;
          }
          return (
            <Legend>
              <Currency.Name currencyKey={displayName} showIcon={true} />
              {(displayName === CryptoCurrency.ETH || displayName === CryptoCurrency.BTC) && (
                <PortfolioTableTooltip currencyKey={cellProps.value} />
              )}
            </Legend>
          );
        },

        sortable: false,
        width: 100,
      },
      {
        Header: <>{t('synths.assets.synths.table.balance')}</>,
        id: 'balance',
        accessor: (originalRow: any) => originalRow.balance.toNumber(),
        sortType: 'basic',
        Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['balance']>) => (
          <Currency.Amount
            amountCurrencyKey={cellProps.row.original.currencyKey}
            amount={cellProps.value}
            valueCurrencyKey={selectedPriceCurrency.name}
            totalValue={cellProps.row.original.usdBalance}
            sign={selectedPriceCurrency.sign}
            conversionRate={selectPriceCurrencyRate}
            showTotalValue={!mobile}
          />
        ),
        width: mobile ? 50 : 100,
        sortable: false,
      },
      {
        Header: <>{t('synths.assets.synths.table.percentage-of-portfolio')}</>,
        id: 'holdings',
        accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
        sortType: 'basic',
        Cell: (cellProps: CellProps<CryptoBalance>) => {
          let variant: ProgressBarType = 'rainbow';
          if (synthsTotalSupply && synthsTotalSupply.supplyData && mergedTotalValue) {
            const { currencyKey } = cellProps.row.original;
            const poolCurrencyPercent = synthsTotalSupply.supplyData[currencyKey].poolProportion;

            if (poolCurrencyPercent) {
              const holdingPercent = mergedTotalValue.eq(0)
                ? wei(0)
                : cellProps.row.original.usdBalance.div(mergedTotalValue);
              const deviationFromPool = holdingPercent.sub(poolCurrencyPercent);

              if (deviationFromPool.abs().gte(SHOW_HEDGING_INDICATOR_THRESHOLD)) {
                variant = 'red-simple';
              } else {
                variant = 'green-simple';
              }
            }
          }

          return (
            <SynthHoldingWrapper>
              <SynthHolding
                usdBalance={cellProps.row.original.usdBalance}
                totalUSDBalance={mergedTotalValue ?? wei(0)}
                progressBarVariant={variant}
                showProgressBar={!mobile}
              />
            </SynthHoldingWrapper>
          );
        },
        width: mobile ? 50 : 100,
        sortable: false,
      },
      // TODO, disable for now..
      // {
      //   Header: <>{t('synths.assets.synths.table.debt-pool-proportion')}</>,
      //   id: 'debt-pool-proportion',
      //   accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
      //   sortType: 'basic',
      //   Cell: (cellProps: CellProps<CryptoBalance>) => {
      //     const { currencyKey } = cellProps.row.original;
      //     if (!synthsTotalSupply || !synthsTotalSupply.supplyData) return null;
      //     const totalPoolValue = synthsTotalSupply?.totalValue ?? wei(0);
      //     const currencyValue = synthsTotalSupply.supplyData[currencyKey]?.value ?? wei(0);

      //     return (
      //       <SynthHoldingWrapper>
      //         <SynthHolding
      //           usdBalance={currencyValue}
      //           totalUSDBalance={totalPoolValue}
      //           showProgressBar={!mobile}
      //         />
      //       </SynthHoldingWrapper>
      //     );
      //   },
      //   width: mobile ? 50 : 100,
      //   sortable: false,
      // },
    ];

    return columns;
  }, [
    selectedPriceCurrency.sign,
    t,
    isAppReady,
    synthsTotalSupply,
    selectPriceCurrencyRate,
    selectedPriceCurrency.name,
    mergedTotalValue,
    mobile,
  ]);

  if (!isWalletConnected) {
    return <ConnectOrSwitchNetwork />;
  }

  return (
    <StyledTable
      palette="primary"
      /* @ts-ignore TODO: replace with chakra table */
      columns={assetColumns}
      data={mergedBalances && mergedBalances.length > 0 ? mergedBalances : []}
      isLoading={isLoading}
      noResultsMessage={
        isLoaded && mergedBalances.length === 0 ? (
          <TableNoResults>
            <TableNoResultsTitle>{t('common.table.no-data')}</TableNoResultsTitle>
          </TableNoResults>
        ) : undefined
      }
      showPagination={true}
    />
  );
};

type PortfolioTableTooptipProps = {
  currencyKey: string;
};

const PortfolioTableTooltip: FC<PortfolioTableTooptipProps> = ({ currencyKey }) => {
  return (
    <StyledTooltip
      arrow={false}
      content={
        <Trans
          i18nKey={`debt.actions.hedge.info.portfolio-table.${currencyKey}-tooltip`}
          components={[<Strong />, <Strong />]}
        ></Trans>
      }
    >
      <TooltipIconContainer>
        <Info width="12" />
      </TooltipIconContainer>
    </StyledTooltip>
  );
};

const Legend = styled(FlexDiv)`
  align-items: center;
`;

const SynthHoldingWrapper = styled.div`
  width: 100px;
`;

const StyledTable = styled(Table)`
  ${media.greaterThan('md')`
    padding: 0 10px;
  `}

  .table-body-cell {
    height: 40px;
  }
  .table-body-cell,
  .table-header-cell {
    &:last-child {
      justify-content: flex-end;
    }
  }
`;

const StyledTooltip = styled(Tooltip)`
  background: ${(props) => props.theme.colors.navy};
  .tippy-arrow {
    color: ${(props) => props.theme.colors.navy};
  }
  .tippy-content {
    font-size: 14px;
  }
`;

const TooltipIconContainer = styled(FlexDiv)`
  margin-left: 14px;
  align-items: center;
  height: 100%;
`;

const Strong = styled.strong`
  font-family: ${(props) => props.theme.fonts.interBold};
`;

export default DebtPoolTable;
