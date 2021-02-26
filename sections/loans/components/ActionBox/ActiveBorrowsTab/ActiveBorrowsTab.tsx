import React from 'react';

import Action, { ACTION_NAMES } from './ModifyLoanActions';
import LoanList from './LoanList';

type ActiveBorrowsTabProps = {
	loanId: string;
	loanAction: string;
	loanTypeIsEth: boolean;
};

const ActiveBorrowsTab: React.FC<ActiveBorrowsTabProps> = ({
	loanId,
	loanAction,
	loanTypeIsEth,
}) => {
	return loanId ? (
		<Action {...{ loanId, loanTypeIsEth, loanAction }} />
	) : (
		<LoanList actions={ACTION_NAMES} />
	);
};

export default ActiveBorrowsTab;
