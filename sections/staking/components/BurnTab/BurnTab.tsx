import React, { FC } from 'react';

import { LoadingState } from 'constants/loading';
import { TabContainer } from '../common';

type BurnTabProps = {
	amountToBurn: number;
	setAmountToBurn: (amount: number) => void;
	burnLoadingState: LoadingState | null;
	setBurnLoadingState: (state: LoadingState | null) => void;
};

const BurnTab: FC<BurnTabProps> = ({
	amountToBurn,
	setAmountToBurn,
	burnLoadingState,
	setBurnLoadingState,
}) => <TabContainer>TODO implement Burn Container</TabContainer>;

export default BurnTab;
