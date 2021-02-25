import React from 'react';

import Deposit from './ModifyLoanActions/Deposit';
import Withdraw from './ModifyLoanActions/Withdraw';
import Repay from './ModifyLoanActions/Repay';
import Draw from './ModifyLoanActions/Draw';
import Close from './ModifyLoanActions/Close';
import LoanList from './LoanList';

const ACTIONS: Record<string, any> = {
	deposit: Deposit,
	withdraw: Withdraw,
	draw: Draw,
	repay: Repay,
	close: Close,
};

const ACTION_NAMES: Array<string> = Object.keys(ACTIONS);

type ActiveBorrowsTabProps = {
	loanId: number;
	loanAction: string;
};

const ActiveBorrowsTab: React.FC<ActiveBorrowsTabProps> = ({ loanId, loanAction }) => {
	const Action = ACTIONS[loanAction];
	return Action ? <Action {...{ loanId }} /> : <LoanList actions={ACTION_NAMES} />;
};

export default ActiveBorrowsTab;
