import React, { FC } from 'react';

import { LoadingState } from 'constants/loading';
import { TabContainer } from '../common';

type MintTabProps = {
	amountToMint: number;
	setAmountToMint: (amount: number) => void;
	mintLoadingState: LoadingState | null;
	setMintLoadingState: (state: LoadingState | null) => void;
};

const MintTab: FC<MintTabProps> = ({
	amountToMint,
	setAmountToMint,
	mintLoadingState,
	setMintLoadingState,
}) => <TabContainer>TODO implement Mint Container</TabContainer>;

export default MintTab;
