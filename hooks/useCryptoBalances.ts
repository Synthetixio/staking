import { useMemo } from 'react';
import { orderBy } from 'lodash';

import useETHBalanceQuery from 'queries/walletBalances/useETHBalanceQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

const { ETH, SNX } = CRYPTO_CURRENCY_MAP;

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
						usdBalance: ETHBalance.multipliedBy(ETHBalance),
					},
					{
						currencyKey: SNX,
						balance: SNXBalance,
						usdBalance: SNXBalance.multipliedBy(SNXBalance),
					},
				],
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
