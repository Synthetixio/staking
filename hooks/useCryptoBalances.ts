import { useMemo } from 'react';
import { orderBy } from 'lodash';

import useETHBalanceQuery from 'queries/walletBalances/useETHBalanceQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CryptoCurrency, Synths } from 'constants/currency';
import { assetToSynth } from 'utils/currencies';
import useWETHBalanceQuery from 'queries/walletBalances/useWETHBalanceQuery';
import useWBTCBalanceQuery from 'queries/walletBalances/useWBTCBalanceQuery';
import useRenBTCBalanceQuery from 'queries/walletBalances/useRenBTCBalanceQuery';

const { ETH, WETH, SNX, BTC, WBTC, RENBTC } = CryptoCurrency;

const useCryptoBalances = () => {
	const ETHBalanceQuery = useETHBalanceQuery();
	const wETHBalanceQuery = useWETHBalanceQuery();
	const wBTCBalanceQuery = useWBTCBalanceQuery();
	const renBTCBalanceQuery = useRenBTCBalanceQuery();
	const SNXBalanceQuery = useSNXBalanceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;

	const isLoaded = ETHBalanceQuery.isSuccess && SNXBalanceQuery.isSuccess;

	const ETHBalance = ETHBalanceQuery.data ?? null;
	const SNXBalance = SNXBalanceQuery.data ?? null;
	const wETHBalance = wETHBalanceQuery.data ?? null;
	const wBTCBalance = wBTCBalanceQuery.data ?? null;
	const renBTCBalance = renBTCBalanceQuery.data ?? null;

	const balances = useMemo(() => {
		if (
			isLoaded &&
			exchangeRates != null &&
			ETHBalance != null &&
			SNXBalance != null &&
			wETHBalance != null &&
			wBTCBalance != null &&
			renBTCBalance != null
		) {
			return orderBy(
				[
					{
						currencyKey: ETH,
						balance: ETHBalance,
						usdBalance: ETHBalance.multipliedBy(exchangeRates[ETH]),
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: WETH,
						balance: wETHBalance,
						usdBalance: wETHBalance.multipliedBy(exchangeRates[ETH]),
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: SNX,
						balance: SNXBalance,
						usdBalance: SNXBalance.multipliedBy(exchangeRates[SNX]),
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: WBTC,
						balance: wBTCBalance,
						usdBalance: wBTCBalance.multipliedBy(exchangeRates[Synths.sBTC]),
						synth: assetToSynth(BTC),
					},
					{
						currencyKey: RENBTC,
						balance: renBTCBalance,
						usdBalance: renBTCBalance.multipliedBy(exchangeRates[Synths.sBTC]),
						synth: assetToSynth(BTC),
					},
				].filter((cryptoBalance) => cryptoBalance.balance.gt(0)),
				(balance) => balance.usdBalance.toNumber(),
				'desc'
			);
		}
		return [];
	}, [isLoaded, ETHBalance, SNXBalance, wETHBalance, wBTCBalance, renBTCBalance, exchangeRates]);

	return {
		balances,
		isLoaded,
	};
};

export default useCryptoBalances;
