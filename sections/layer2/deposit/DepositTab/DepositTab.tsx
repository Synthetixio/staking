import React, { useState, useEffect, useCallback } from 'react';
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

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import synthetix from 'lib/synthetix';
import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';

import GasSelector from 'components/GasSelector';
import Button from 'components/Button';
import ApproveModal from 'components/ApproveModal';
import TabContent from './TabContent';

const SNX_DECIMALS = 2;

const DepositTab = () => {
	const { t } = useTranslation();
	const tokenToApprove = CryptoCurrency['SNX'];
	const { transferableCollateral } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
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
			if (isAppReady && walletAddress) {
				try {
					setIsApproved(true);
				} catch (e) {}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [gasEstimateError, walletAddress, isAppReady]);

	const getAllowance = useCallback(async () => {
		if (walletAddress && isAppReady) {
			const {
				contracts: { Synthetix, SynthetixBridgeToOptimism },
			} = synthetix.js!;
			try {
				const allowance = await Synthetix.allowance(
					walletAddress,
					SynthetixBridgeToOptimism.address
				);

				setIsApproved(!!(allowance / 1e18));
			} catch (e) {
				console.log(e);
				setIsApproved(false);
			}
		}
	}, [walletAddress, isAppReady]);

	useEffect(() => {
		getAllowance();
	}, [getAllowance]);

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
					tokenContract="Synthetix"
					contractToApprove="SynthetixBridgeToOptimism"
					onApproved={getAllowance}
				/>
			) : null}
			<TabContent
				depositAmount={transferableCollateral}
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

export default DepositTab;
