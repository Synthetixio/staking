import React from 'react';
import Wrapper from './Wrapper';

type WithdrawProps = {
	loanId: number;
};

const Withdraw: React.FC<WithdrawProps> = ({ loanId }) => <Wrapper>Withdraw</Wrapper>;

export default Withdraw;
