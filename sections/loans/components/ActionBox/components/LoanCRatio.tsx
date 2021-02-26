import React from 'react';
import { useTranslation } from 'react-i18next';
import { toBig } from 'utils/formatters/big-number';
import { Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { MIN_CRATIO, SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { Loan } from 'queries/loans/types';
import CRatio from './CRatio';

type LoanCRatioProps = {
	loan: Loan;
	loanTypeIsETH: boolean;
};

const LoanCRatio: React.FC<LoanCRatioProps> = ({ loan, loanTypeIsETH }) => {
	const { t } = useTranslation();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const [cratio, setCRatio] = React.useState(toBig(0));

	const hasLowCRatio = React.useMemo(() => cratio.lt(MIN_CRATIO), [cratio]);

	// cratio
	React.useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!exchangeRates) {
				return setCRatio(toBig('0'));
			}

			const collateralUSDPrice = toBig(
				getExchangeRatesForCurrencies(
					exchangeRates,
					loanTypeIsETH ? Synths.sETH : Synths.sBTC,
					Synths.sUSD
				)
			);
			const debtAsset = SYNTH_BY_CURRENCY_KEY[loan.currency];
			const debtUSDPrice = toBig(
				getExchangeRatesForCurrencies(exchangeRates, debtAsset, Synths.sUSD)
			);
			const cratio = toBig(loan.collateral)
				.mul(collateralUSDPrice)
				.div(Math.pow(10, 18))
				.mul(100)
				.div(debtUSDPrice.mul(toBig(loan.amount)).div(Math.pow(10, 18)));
			if (isMounted) setCRatio(cratio);
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [loan.collateral, loan.amount]);

	return <CRatio {...{ cratio, hasLowCRatio }} />;
};

export default LoanCRatio;
