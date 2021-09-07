import { FC, useMemo } from 'react';

import { Loan } from 'queries/loans/types';

import CRatio from './CRatio';
import Wei, { wei } from '@synthetixio/wei';

type LoanCRatioProps = {
	loan: Loan;
	minCRatio: Wei;
};

const LoanCRatio: FC<LoanCRatioProps> = ({ loan, minCRatio }) => {
	const cratio = useMemo(() => wei(loan.cratio), [loan.cratio]);
	const hasLowCRatio = useMemo(() => cratio.mul(100).lt(minCRatio), [cratio, minCRatio]);
	return <CRatio {...{ cratio, hasLowCRatio, minCRatio }} />;
};

export default LoanCRatio;
