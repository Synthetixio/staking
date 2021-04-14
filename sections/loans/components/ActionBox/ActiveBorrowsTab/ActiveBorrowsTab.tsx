import React from 'react';

import Action, { ACTION_NAMES } from './ModifyLoanActions';
import LoanList from './LoanList';

type ActiveBorrowsTabProps = {
	loanId: string;
	loanAction: string;
	loanTypeIsETH: boolean;
};

const ActiveBorrowsTab: React.FC<ActiveBorrowsTabProps> = ({
	loanId,
	loanAction,
	loanTypeIsETH,
}) => {
	return loanId ? (
		<Action {...{ loanId, loanTypeIsETH, loanAction }} />
	) : (
		<LoanList actions={ACTION_NAMES} />
	);
};

export default ActiveBorrowsTab;
