import React from 'react';
import { MIN_CRATIO } from 'sections/loans/constants';
import { Loan } from 'queries/loans/types';
import CRatio from './CRatio';

type LoanCRatioProps = {
	loan: Loan;
};

const LoanCRatio: React.FC<LoanCRatioProps> = ({ loan }) => {
	const cratio = loan.cratio;
	const hasLowCRatio = React.useMemo(() => cratio.lt(MIN_CRATIO), [cratio]);
	return <CRatio {...{ cratio, hasLowCRatio }} />;
};

export default LoanCRatio;
