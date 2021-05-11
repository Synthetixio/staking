import BN from 'bn.js';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { priceCurrencyState } from 'store/app';
import { divBN } from 'utils/formatters/number';

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const getPriceAtCurrentRate = useCallback(
		(price: BN) => {
			return selectPriceCurrencyRate != null ? divBN(price, selectPriceCurrencyRate) : price;
		},
		[selectPriceCurrencyRate]
	);

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	};
};

export default useSelectedPriceCurrency;
