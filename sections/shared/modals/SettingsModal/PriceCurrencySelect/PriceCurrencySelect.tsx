import { useMemo, FC } from 'react';

import Select from 'components/Select';

import { priceCurrencyState, PRICE_CURRENCIES } from 'store/app';

import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import Connector from 'containers/Connector';

export const PriceCurrencySelect: FC = () => {
	const [priceCurrency, setPriceCurrency] = usePersistedRecoilState(priceCurrencyState);

	const { synthsMap, network } = Connector.useContainer();

	const currencyOptions = useMemo(() => {
		if (network != null) {
			return PRICE_CURRENCIES.filter(
				(currencyKey) => synthsMap != null && synthsMap![currencyKey]
			).map((currencyKey) => {
				const synth = synthsMap![currencyKey];
				return {
					label: synth.asset,
					value: synth,
				};
			});
		}
		return [];
	}, [network, synthsMap]);

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
