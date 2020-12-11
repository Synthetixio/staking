import { useMemo } from 'react';
import { orderBy } from 'lodash';

import useETHBalanceQuery from 'queries/walletBalances/useETHBalanceQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CryptoCurrency } from 'constants/currency';
import { assetToSynth } from 'utils/currencies';

const { ETH, SNX } = CryptoCurrency;

const useCryptoBalances = () => {
	const ETHBalanceQuery = useETHBalanceQuery();
	const SNXBalanceQuery = useSNXBalanceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;

	const isLoaded = ETHBalanceQuery.isSuccess && SNXBalanceQuery.isSuccess;

	const ETHBalance = ETHBalanceQuery.data ?? null;
	const SNXBalance = SNXBalanceQuery.data ?? null;

	const balances = useMemo(() => {
		if (isLoaded && exchangeRates != null && ETHBalance != null && SNXBalance != null) {
			return orderBy(
				[
					{
						currencyKey: ETH,
						balance: ETHBalance,
						usdBalance: ETHBalance.multipliedBy(exchangeRates[ETH]),
						synth: assetToSynth(ETH),
					},
					{
						currencyKey: SNX,
						balance: SNXBalance,
						usdBalance: SNXBalance.multipliedBy(exchangeRates[SNX]),
						synth: assetToSynth(ETH),
					},
				].filter((cryptoBalance) => cryptoBalance.balance.gt(0)),
				(balance) => balance.usdBalance.toNumber(),
				'desc'
			);
		}
		return [];
	}, [isLoaded, ETHBalance, SNXBalance, exchangeRates]);

	return {
		balances,
		isLoaded,
	};
};

export default useCryptoBalances;
