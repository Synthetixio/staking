import { FC, useMemo } from 'react';
import { Loan } from 'containers/Loans/types';
import CRatio from './CRatio';
import Wei, { wei } from '@synthetixio/wei';

type LoanCRatioProps = {
  loan: Loan;
  minCRatio: Wei;
  safeMinCRatio: Wei;
};

const LoanCRatio: FC<LoanCRatioProps> = ({ loan, minCRatio, safeMinCRatio }) => {
  const cratio = useMemo(() => wei(loan.cratio), [loan.cratio]);
  const hasLowCRatio = useMemo(() => cratio.mul(100).lt(minCRatio), [cratio, minCRatio]);
  return <CRatio {...{ cratio, hasLowCRatio, minCRatio, safeMinCRatio }} />;
};

export default LoanCRatio;
