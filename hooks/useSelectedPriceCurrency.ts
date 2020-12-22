import BigNumber from 'bignumber.js';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { priceCurrencyState } from 'store/app';

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const getPriceAtCurrentRate = useCallback(
		(price: BigNumber) =>
			selectPriceCurrencyRate != null ? price.dividedBy(selectPriceCurrencyRate) : price,
		[selectPriceCurrencyRate]
	);

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	};
};

export default useSelectedPriceCurrency;
