import { useMemo, FC } from 'react';

import Select from 'components/Select';

import { priceCurrencyState, PRICE_CURRENCIES } from 'store/app';

import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import useSynthetixQueries from '@synthetixio/queries';
import { notNill } from 'utils/ts-helpers';

export const PriceCurrencySelect: FC = () => {
  const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);
  const { useGetSynthsByName } = useSynthetixQueries();
  const synthsByNameQuery = useGetSynthsByName();

  const currencyOptions = useMemo(() => {
    if (synthsByNameQuery.data) {
      return PRICE_CURRENCIES.map((priceCurrency) => synthsByNameQuery.data[priceCurrency])
        .filter(notNill)
        .map((synth) => ({
          label: synth.asset,
          value: synth,
        }));
    }
    return [];
  }, [synthsByNameQuery.data]);

  return (
    <Select
      inputId="currency-options"
      formatOptionLabel={(option) => (
        <span>
          {option.value.sign} {option.value.asset}
        </span>
      )}
      options={currencyOptions}
      value={{ label: priceCurrency.asset, value: priceCurrency }}
      onChange={(option) => {
        if (option) {
          // @ts-ignore
          setPriceCurrency(option.value);
        }
      }}
      variant="outline"
    />
  );
};

export default PriceCurrencySelect;
