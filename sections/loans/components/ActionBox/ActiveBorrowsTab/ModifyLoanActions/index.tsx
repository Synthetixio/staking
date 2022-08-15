import { FC, useMemo } from 'react';
import styled from 'styled-components';

import Spinner from 'assets/svg/app/loader.svg';
import Loans from 'containers/Loans';

import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Repay from './Repay';
import Draw from './Draw';
import Close from './Close';
import Connector from 'containers/Connector';

export const ACTIONS: Record<string, any> = {
  deposit: Deposit,
  withdraw: Withdraw,
  repay: Repay,
  draw: Draw,
  close: Close,
};

export const ACTION_NAMES: Array<string> = Object.keys(ACTIONS);

type ActionsProps = {
  loanId: string;
  loanAction: string;
};

const Actions: FC<ActionsProps> = ({ loanId, loanAction }) => {
  const { synthetixjs } = Connector.useContainer();
  const { isLoadingLoans, loans } = Loans.useContainer();

  const Action = ACTIONS[loanAction];

  const loan = useMemo(() => loans.find((l) => l.id.toString() === loanId), [loans, loanId]);

  const loanContract = synthetixjs?.contracts.ethLoanContract;
  const loanStateContract = synthetixjs?.contracts.ethLoanStateContract;
  return isLoadingLoans ? (
    <StyledSpinner width="38" />
  ) : !loan ? null : (
    <Action
      {...{
        loanId,
        loan,
        loanContract,
        loanStateContract,
      }}
    />
  );
};

export default Actions;

const StyledSpinner = styled(Spinner)`
  display: block;
  margin: 30px auto;
`;
