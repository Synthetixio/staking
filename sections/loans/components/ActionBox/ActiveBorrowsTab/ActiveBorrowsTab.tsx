import React from 'react';

import Action, { ACTION_NAMES } from './ModifyLoanActions';
import LoanList from './LoanList';

type ActiveBorrowsTabProps = {
  loanId: string;
  loanAction: string;
};

const ActiveBorrowsTab: React.FC<ActiveBorrowsTabProps> = ({ loanId, loanAction }) => {
  return loanId ? <Action {...{ loanId, loanAction }} /> : <LoanList actions={ACTION_NAMES} />;
};

export default ActiveBorrowsTab;
