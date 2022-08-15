/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { orderBy } from 'lodash';

import { CryptoCurrency, Synths } from 'constants/currency';
import { assetToSynth } from 'utils/currencies';

import useSynthetixQueries from '@synthetixio/queries';
import { NetworkIdByName } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { renBTCToken, wBTCToken, wETHToken } from 'contracts';
import { getETHToken } from 'contracts/ethToken';
import Connector from 'containers/Connector';

const { ETH, WETH, SNX, BTC, WBTC, RENBTC } = CryptoCurrency;

export type CryptoBalance = {
  currencyKey: string;
  balance: Wei;
  usdBalance: Wei;
  synth?: string;
  transferrable?: Wei;
};

const useCryptoBalances = (walletAddress: string | null) => {
  const { useTokensBalancesQuery, useExchangeRatesQuery, useGetDebtDataQuery } =
    useSynthetixQueries();

  const { network } = Connector.useContainer();

  const tokenDefs = [getETHToken(network)];

  if (network?.id === NetworkIdByName.mainnet) {
    tokenDefs.push(
      ...[
        {
          symbol: 'WBTC',
          address: wBTCToken.address,
          decimals: 18,
          logoURI: '',
          name: 'Wrapped Bitcoin',
          chainId: NetworkIdByName.mainnet,
          tags: [],
        },
        {
          symbol: 'WETH',
          address: wETHToken.address,
          decimals: 18,
          logoURI: '',
          name: 'Wrapped Ethereum',
          chainId: NetworkIdByName.mainnet,
          tags: [],
        },
        {
          symbol: 'renBTC',
          address: renBTCToken.ADDRESSES['mainnet'],
          decimals: 18,
          logoURI: '',
          name: 'renBTC',
          chainId: NetworkIdByName.mainnet,
          tags: [],
        },
      ]
    );
  }
  const balancesQuery = useTokensBalancesQuery(tokenDefs, walletAddress);

  const exchangeRatesQuery = useExchangeRatesQuery();

  const debtQuery = useGetDebtDataQuery(walletAddress);

  const exchangeRates = exchangeRatesQuery.data ?? null;

  const isLoaded = balancesQuery.isSuccess && exchangeRatesQuery.isSuccess;

  const balancesData = balancesQuery.data!;

  const ETHBalance = (balancesQuery.isSuccess && balancesData['ETH']?.balance) || wei(0);
  const SNXBalance = debtQuery?.data?.collateral || wei(0);
  const wETHBalance = (balancesQuery.isSuccess && balancesData['WETH']?.balance) || wei(0);
  const wBTCBalance = (balancesQuery.isSuccess && balancesData['WBTC']?.balance) || wei(0);
  const renBTCBalance = (balancesQuery.isSuccess && balancesData['renBTC']?.balance) || wei(0);
  const transferrableSNX = debtQuery?.data?.transferable ?? wei(0);

  const balances = useMemo<CryptoBalance[]>(() => {
    if (isLoaded && exchangeRates != null) {
      return orderBy(
        [
          {
            currencyKey: ETH,
            balance: ETHBalance,
            usdBalance: ETHBalance.mul(exchangeRates[ETH]),
            synth: assetToSynth(ETH),
          },
          {
            currencyKey: WETH,
            balance: wETHBalance,
            usdBalance: wETHBalance.mul(exchangeRates[ETH]),
            synth: assetToSynth(ETH),
          },
          {
            currencyKey: SNX,
            balance: SNXBalance,
            usdBalance: SNXBalance.mul(exchangeRates[SNX]),
            synth: assetToSynth(ETH),
            transferrable: transferrableSNX,
          },
          {
            currencyKey: WBTC,
            balance: wBTCBalance,
            usdBalance: wBTCBalance.mul(exchangeRates[Synths.sBTC]),
            synth: assetToSynth(BTC),
          },
          {
            currencyKey: RENBTC,
            balance: renBTCBalance,
            usdBalance: renBTCBalance.mul(exchangeRates[Synths.sBTC]),
            synth: assetToSynth(BTC),
          },
        ].filter((cryptoBalance) => cryptoBalance.balance.gt(0)),
        (balance) => balance.usdBalance.toNumber(),
        'desc'
      );
    }
    return [];
  }, [
    isLoaded,
    ETHBalance.toString(),
    SNXBalance.toString(),
    wETHBalance.toString(),
    wBTCBalance.toString(),
    renBTCBalance.toString(),
    JSON.stringify(exchangeRates),
    transferrableSNX.toString(),
  ]);
  return useMemo(() => ({ balances, isLoaded }), [balances, isLoaded]);
};

export default useCryptoBalances;
