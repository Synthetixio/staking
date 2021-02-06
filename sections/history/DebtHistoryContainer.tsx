import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ValueType } from 'react-select';
import { useRecoilValue } from 'recoil';
import orderBy from 'lodash/orderBy';
import keyBy from 'lodash/keyBy';

import { isWalletConnectedState } from 'store/wallet';

//import { DebtHistoryTransaction } from 'queries/staking/types';

import Connector from 'containers/Connector';

import {
	DebtHistoryContainerProps
} from './types';


const DebtHistoryContainer: FC<DebtHistoryContainerProps> = ({
    issued,
    burned,
	debtHistory,
    debtBalance,
	isLoaded,
}) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();

	return (
		<>
		</>
	);
};


export default DebtHistoryContainer;
