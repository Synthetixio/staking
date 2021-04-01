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
import { zeroBN } from 'utils/formatters/number';

const { ETH, WETH, SNX, BTC, WBTC, RENBTC } = CryptoCurrency;

const useCryptoBalances = () => {
	const ETHBalanceQuery = useETHBalanceQuery();
	const wETHBalanceQuery = useWETHBalanceQuery();
	const wBTCBalanceQuery = useWBTCBalanceQuery();
	const renBTCBalanceQuery = useRenBTCBalanceQuery();
	const SNXBalanceQuery = useSNXBalanceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;

	const isLoaded =
		ETHBalanceQuery.isSuccess && SNXBalanceQuery.isSuccess && exchangeRatesQuery.isSuccess;

	const ETHBalance = ETHBalanceQuery.data ?? zeroBN;
	const SNXBalance = SNXBalanceQuery.data ?? zeroBN;
	const wETHBalance = wETHBalanceQuery.data ?? zeroBN;
	const wBTCBalance = wBTCBalanceQuery.data ?? zeroBN;
	const renBTCBalance = renBTCBalanceQuery.data ?? zeroBN;

	const balances = useMemo(() => {
		if (isLoaded && exchangeRates != null) {
			return orderBy(
				[
					{
						currencyKey: ETH,
						balance: ETHBalance,
						usdBalance: ETHBalance ? ETHBalance.multipliedBy(exchangeRates[ETH]) : zeroBN,
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: WETH,
						balance: wETHBalance,
						usdBalance: wETHBalance ? wETHBalance.multipliedBy(exchangeRates[ETH]) : zeroBN,
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: SNX,
						balance: SNXBalance,
						usdBalance: SNXBalance ? SNXBalance.multipliedBy(exchangeRates[SNX]) : zeroBN,
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: WBTC,
						balance: wBTCBalance,
						usdBalance: wBTCBalance ? wBTCBalance.multipliedBy(exchangeRates[Synths.sBTC]) : zeroBN,
						synth: assetToSynth(BTC),
					},
					{
						currencyKey: RENBTC,
						balance: renBTCBalance,
						usdBalance: renBTCBalance
							? renBTCBalance.multipliedBy(exchangeRates[Synths.sBTC])
							: zeroBN,
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
