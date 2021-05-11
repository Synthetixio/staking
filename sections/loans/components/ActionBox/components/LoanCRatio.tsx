import { FC, useMemo } from 'react';
import BN from 'bn.js';

import { toBigNumber } from 'utils/formatters/number';
import { Loan } from 'queries/loans/types';

import CRatio from './CRatio';

type LoanCRatioProps = {
	loan: Loan;
	minCRatio: BN;
};

const LoanCRatio: FC<LoanCRatioProps> = ({ loan, minCRatio }) => {
	const cratio = useMemo(() => toBigNumber(loan.cratio.toString()).div(toBigNumber(1e16)), [
		loan.cratio,
	]);
	const hasLowCRatio = useMemo(() => cratio.lt(minCRatio), [cratio, minCRatio]);
	return <CRatio {...{ cratio, hasLowCRatio, minCRatio }} />;
};

export default LoanCRatio;
