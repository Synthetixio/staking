import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Connector from 'containers/Connector';

import {
  ExternalLink,
  TableNoResults,
  TableNoResultsTitle,
  TableNoResultsDesc,
  TableNoResultsButtonContainer,
  NoTextTransform,
} from 'styles/common';
import { CryptoBalance } from 'hooks/useCryptoBalances';

import { EXTERNAL_LINKS } from 'constants/links';
import { CryptoCurrency } from 'constants/currency';
import ROUTES from 'constants/routes';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';
import Button from 'components/Button';
import SynthHolding from 'components/SynthHolding';

import { isSynth } from 'utils/currencies';

import SynthPriceCol from './SynthPriceCol';
import { StyledButtonBlue, StyledButtonPink } from './common';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import ConnectOrSwitchNetwork from 'components/ConnectOrSwitchNetwork';
import useSynthetixQueries from '@synthetixio/queries';

type AssetsTableProps = {
  assets: CryptoBalance[];
  totalValue: Wei;
  isLoading: boolean;
  isLoaded: boolean;
  showConvert: boolean;
  showHoldings: boolean;
  isDeprecated?: boolean;
  onTransferClick?: (currencyKey: string) => void;
  showValue?: boolean;
  showTotalValue?: boolean;
  showPrice?: boolean;
};

const AssetsTable: FC<AssetsTableProps> = ({
  assets,
  totalValue,
  isLoading,
  isLoaded,
  showHoldings,
  showConvert,
  onTransferClick,
  showValue = true,
  showTotalValue = true,
  showPrice = true,
}) => {
  const { t } = useTranslation();
  const { isAppReady, isL2, isWalletConnected } = Connector.useContainer();
  const { useGetSynthsByName } = useSynthetixQueries();
  const synthByNameQuery = useGetSynthsByName();
  const router = useRouter();

  const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
  const totalValueString = totalValue.toString();
  const selectPriceCurrencyRateString = selectPriceCurrencyRate?.toString();
  const assetColumns: any[] = useMemo(() => {
    if (!isAppReady) {
      return [];
    }

    return [
      {
        Header: <>{t('synths.assets.synths.table.asset')}</>,
        accessor: 'currencyKey',
        sortable: true,
        width: 40,
        Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['currencyKey']>) => {
          return <Currency.Icon currencyKey={cellProps.value} />;
        },
      },
      {
        Header: <RightColHeader>{t('synths.assets.synths.table.balance-mobile')}</RightColHeader>,
        id: 'right',
        Cell: (cellProps: CellProps<CryptoBalance>) => {
          const asset = cellProps.row.original;
          const synthDesc = synthByNameQuery.data?.[asset.currencyKey]?.description ?? '';

          const currencyIsSynth = useMemo(() => isSynth(asset.currencyKey), [asset.currencyKey]);

          return (
            <RightCol>
              <div>
                {currencyIsSynth
                  ? t('common.currency.synthetic-currency-name', { currencyName: synthDesc })
                  : asset.currencyKey}
              </div>
              <div>
                <Currency.Amount
                  amountCurrencyKey={asset.currencyKey}
                  amount={asset.balance}
                  valueCurrencyKey={selectedPriceCurrency.name}
                  totalValue={asset.usdBalance}
                  sign={selectedPriceCurrency.sign}
                  conversionRate={wei(selectPriceCurrencyRateString)}
                  {...{ showValue, showTotalValue }}
                />
              </div>

              <div>{currencyIsSynth ? asset.currencyKey : null}</div>

              {showPrice && (
                <div>
                  <SynthPriceCol currencyKey={asset.currencyKey as CurrencyKey} />
                </div>
              )}

              {!showHoldings ? null : (
                <>
                  <div>{t('synths.assets.synths.table.holdings')}</div>
                  <div>
                    <SynthHolding
                      usdBalance={asset.usdBalance}
                      totalUSDBalance={wei(totalValueString || 0)}
                    />
                  </div>
                </>
              )}

              <div></div>
              <div>
                <ActionButtonsContainer>
                  {!showConvert ? null : (
                    <>
                      {asset.currencyKey === CryptoCurrency.SNX ? (
                        <Link href={ROUTES.Staking.Home}>
                          <StyledButtonPink>{t('common.stake-snx')}</StyledButtonPink>
                        </Link>
                      ) : (
                        <ExternalLink
                          href={EXTERNAL_LINKS.Trading.OneInchLink(
                            asset.currencyKey,
                            CryptoCurrency.SNX
                          )}
                        >
                          <StyledButtonPink>
                            <Trans
                              i18nKey="common.currency.buy-currency"
                              values={{
                                currencyKey: CryptoCurrency.SNX,
                              }}
                              components={[<NoTextTransform />]}
                            />
                          </StyledButtonPink>
                        </ExternalLink>
                      )}
                    </>
                  )}

                  {!(!isL2 && onTransferClick) ? null : (
                    <>
                      {!(
                        isSynth(asset.currencyKey) || asset.currencyKey === CryptoCurrency.SNX
                      ) ? null : (
                        <StyledButtonBlue onClick={() => onTransferClick(asset.currencyKey)}>
                          {t('synths.assets.synths.table.transfer')}
                        </StyledButtonBlue>
                      )}
                    </>
                  )}
                </ActionButtonsContainer>
              </div>
            </RightCol>
          );
        },
      },
    ];
  }, [
    isAppReady,
    t,
    synthByNameQuery.data,
    selectedPriceCurrency.name,
    selectedPriceCurrency.sign,
    selectPriceCurrencyRateString,
    showValue,
    showTotalValue,
    showPrice,
    showHoldings,
    totalValueString,
    showConvert,
    isL2,
    onTransferClick,
  ]);

  return (
    <StyledTable
      palette="primary"
      /* @ts-ignore TODO: replace with chakra table */
      columns={assetColumns}
      data={assets}
      isLoading={isLoading}
      noResultsMessage={
        !isWalletConnected ? (
          <TableNoResults>
            <ConnectOrSwitchNetwork />
          </TableNoResults>
        ) : isLoaded && assets.length === 0 ? (
          <TableNoResults>
            <TableNoResultsTitle>
              {t('synths.assets.synths.table.no-synths.title')}
            </TableNoResultsTitle>
            <TableNoResultsDesc>
              {t('synths.assets.synths.table.no-synths.desc')}
            </TableNoResultsDesc>
            <TableNoResultsButtonContainer>
              <Button variant="primary" onClick={() => router.push(ROUTES.Staking.Home)}>
                {t('common.stake-snx')}
              </Button>
            </TableNoResultsButtonContainer>
          </TableNoResults>
        ) : undefined
      }
      showPagination={true}
    />
  );
};

const StyledTable = styled(Table)`
  .table-body-cell {
    height: auto;
    align-items: flex-start;

    &:first-child {
      width: 40px !important;
      justify-content: center;
      padding: 20px 0;
    }
    &:last-child {
      padding-top: 14px;
      width: calc(100% - 40px) !important;
      padding: 20px 10px 20px 0;
    }
  }
`;

const RightCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-row-gap: 1rem;
  flex: 1;

  & > div:nth-child(even) {
    text-align: right;
    justify-content: flex-end;
    display: flex;
  }
`;

const RightColHeader = styled.div`
  text-align: right;
  width: 100%;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

export default AssetsTable;
