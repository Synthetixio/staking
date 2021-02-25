import React from 'react';
import Wrapper from './Wrapper';

type CloseProps = {
	loanId: number;
};

const Close: React.FC<CloseProps> = ({ loanId }) => <Wrapper>Close</Wrapper>;

export default Close;
