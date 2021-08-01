import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { TabContainer } from '../../components/common';
import { Transaction, GasLimitEstimate } from 'constants/network';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useGetDepositsDataQuery from 'queries/deposits/useGetDepositsDataQuery';
import synthetix from 'lib/synthetix';
import TransactionNotifier from 'containers/TransactionNotifier';
import { appReadyState } from 'store/app';
import { walletAddressState, isEOAWalletState } from 'store/wallet';

import ApproveModal from 'components/ApproveModal';
import TabContent from './TabContent';
import { normalizedGasPrice } from 'utils/network';
import { amountToDepositState } from 'store/layer2';
import { toBigNumber } from 'utils/formatters/number';

const DepositTab = () => {
	const { t } = useTranslation();
	const { transferableCollateral } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const isEOAWallet = useRecoilValue(isEOAWalletState);
	const amountToDeposit = useRecoilValue(amountToDepositState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const depositsDataQuery = useGetDepositsDataQuery();

	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [depositTxError, setDepositTxError] = useState<string | null>(null);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [txHash, setTxHash] = useState<string | null>(null);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && walletAddress && isApproved && amountToDeposit) {
				try {
					if (isEOAWallet === false) throw new Error(t('layer2.error.non-eoa-wallet'));
					setGasEstimateError(null);
					const {
						contracts: { SynthetixBridgeToOptimism },
						utils: { parseEther },
					} = synthetix.js!;
					const gasEstimate = await synthetix.getGasEstimateForTransaction({
						txArgs: [parseEther(amountToDeposit)],
						method: SynthetixBridgeToOptimism.estimateGas.deposit,
					});
					setGasLimitEstimate(gasEstimate);
				} catch (e) {
					console.log(e);
					setGasEstimateError(e.message);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [walletAddress, isAppReady, isApproved, transferableCollateral]);

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
		if (isAppReady && !gasEstimateError) {
			const {
				contracts: { SynthetixBridgeToOptimism },
				utils: { parseEther },
			} = synthetix.js!;
			try {
				setDepositTxError(null);
				setTxModalOpen(true);

				const amountToDepositBN = toBigNumber(amountToDeposit);

				if (amountToDepositBN.gt(transferableCollateral)) {
					throw new Error(t('layer2.error.insufficient-balance'));
				}

				const transaction = await SynthetixBridgeToOptimism.deposit(parseEther(amountToDeposit), {
					gasLimit: gasLimitEstimate,
					gasPrice: normalizedGasPrice(gasPrice),
				});

				if (transaction) {
					setTxHash(transaction.hash);
					setTransactionState(Transaction.WAITING);
					monitorTransaction({
						txHash: transaction.hash,
						onTxConfirmed: () => {
							setTransactionState(Transaction.SUCCESS);
							depositsDataQuery.refetch();
						},
						onTxFailed: (txData) => {
							setTransactionState(Transaction.PRESUBMIT);
							setDepositTxError(txData?.failureReason ?? null);
						},
					});
					setTxModalOpen(false);
				}
			} catch (e) {
				console.log(e);
				setDepositTxError(e.message);
			}
		}
	};

	return (
		<StyledTabContainer>
			{!isApproved ? (
				<ApproveModal
					description={t('layer2.actions.deposit.action.approve.description')}
					tokenContract="Synthetix"
					contractToApprove="SynthetixBridgeToOptimism"
					onApproved={getAllowance}
				/>
			) : null}
			<TabContent
				transferableCollateral={transferableCollateral}
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
		</StyledTabContainer>
	);
};

const StyledTabContainer = styled(TabContainer)`
	position: relative;
	padding: 0;
`;

export default DepositTab;
