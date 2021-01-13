import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import { FlexDivColCentered } from 'styles/common';
import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { TabContainer } from '../../components/common';
import { Transaction } from 'constants/network';

import { CryptoCurrency } from 'constants/currency';
import { formatCryptoCurrency } from 'utils/formatters/number';

import useEscrowCalculations from 'sections/escrow/hooks/useEscrowCalculations';
import { appReadyState } from 'store/app';
import { isWalletConnectedState } from 'store/wallet';

import GasSelector from 'components/GasSelector';
import Button from 'components/Button';
import ApproveModal from 'components/ApproveModal';
import TabContent from './TabContent';

const SNX_DECIMALS = 2;

const MigrateTab = () => {
	const { t } = useTranslation();
	const depositCurrencyKey = CryptoCurrency['SNX'];

	const escrowCalculations = useEscrowCalculations();
	const totalEscrowed = escrowCalculations?.totalEscrowBalance;

	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);

	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [depositTxError, setDepositTxError] = useState<string | null>(null);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [txHash, setTxHash] = useState<string | null>(null);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				try {
					setIsApproved(true);
				} catch (e) {}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [gasEstimateError, isWalletConnected, isAppReady]);

	useEffect(() => {
		const getAllowance = async () => {
			if (isWalletConnected && isAppReady) {
				try {
				} catch (e) {}
			}
		};
		getAllowance();
	}, [isWalletConnected, isAppReady]);

	const handleDeposit = async () => {
		if (isAppReady) {
			try {
				setDepositTxError(null);
				setTxModalOpen(true);

				// INSERT TX HERE
				const transaction = { hash: '0x000' };
				if (transaction) {
					setTxHash(transaction.hash);
					setTransactionState(Transaction.WAITING);
					// monitorHash({
					// 	txHash: transaction.hash,
					// 	onTxConfirmed: () => {
					// 		setTransactionState(Transaction.SUCCESS);
					// 	},
					// });
					setTransactionState(Transaction.SUCCESS);
					setTxModalOpen(false);
				}
			} catch (e) {}
		}
	};

	return (
		<TabContainer>
			{!isApproved ? (
				<ApproveModal
					description={t('layer2.actions.deposit.action.approve.description')}
					isApproving={false}
					tokenContract="Synthetix"
					contractToApprove="SynthetixBridgeToOptimism"
					onApprove={() => setIsApproved(true)}
				/>
			) : null}
			<TabContent
				escrowedAmount={totalEscrowed}
				onSubmit={handleDeposit}
				transactionError={depositTxError}
				gasEstimateError={gasEstimateError}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={gasLimitEstimate}
				setGasPrice={setGasPrice}
				txHash={txHash}
				transactionState={transactionState}
				setTransactionState={setTransactionState}
			/>
		</TabContainer>
	);
};

export default MigrateTab;
