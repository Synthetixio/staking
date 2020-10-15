import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Synth } from 'lib/synthetix';

import Currency from 'components/Currency';

import { NO_VALUE } from 'constants/placeholder';

import { SelectableCurrencyRow } from 'styles/common';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import { Period } from 'constants/period';

type SynthRow = {
	price: number | null;
	synth: Synth;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
	onClick: () => void;
};
const SynthRow: FC<SynthRow> = ({
	price,
	synth,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
	onClick,
}) => {
	const { t } = useTranslation();

	const currencyKey = synth.name;

	const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);

	return (
		<StyledSelectableCurrencyRow key={currencyKey} onClick={onClick} isSelectable={true}>
			<Currency.Name
				currencyKey={currencyKey}
				name={t('common.currency.synthetic-currency-name', {
					currencyName: synth.description,
				})}
				showIcon={true}
			/>
			{price != null ? (
				<Currency.Price
					currencyKey={currencyKey}
					price={price}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
					change={historicalRates.data?.change}
				/>
			) : (
				NO_VALUE
			)}
		</StyledSelectableCurrencyRow>
	);
};

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`;

export default SynthRow;
