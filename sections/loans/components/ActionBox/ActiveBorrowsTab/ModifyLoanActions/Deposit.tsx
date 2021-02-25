import React from 'react';
import Wrapper from './Wrapper';

type DepositProps = {
	loanId: number;
};

const Deposit: React.FC<DepositProps> = ({ loanId }) => <Wrapper>Deposit</Wrapper>;

export default Deposit;
