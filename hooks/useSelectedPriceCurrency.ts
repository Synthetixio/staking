import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { priceCurrencyState } from 'store/app';
import useSynthetixQueries from '@synthetixio/queries';

const useSelectedPriceCurrency = (networkId: NetworkId) => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);

	const { useExchangeRatesQuery } = useSynthetixQueries({ networkId });
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const getPriceAtCurrentRate = useCallback(
		(price: Wei) => (selectPriceCurrencyRate != null ? price.div(selectPriceCurrencyRate) : price),
		[selectPriceCurrencyRate]
	);

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	};
};

export default useSelectedPriceCurrency;
