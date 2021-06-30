import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { TabContainer } from '../../components/common';
import { Transaction, GasLimitEstimate } from 'constants/network';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useGetWithdrawalsDataQuery from 'queries/withdrawals/useGetWithdrawalsDataQuery';
import synthetix from 'lib/synthetix';
import TransactionNotifier from 'containers/TransactionNotifier';
import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';

import TabContent from './TabContent';
import { normalizedGasPrice } from 'utils/network';
import BigNumber from 'bignumber.js';
import { toBigNumber } from 'utils/formatters/number';
import useGetWithdrawalsIsActiveQuery from 'queries/withdrawals/useGetWithdrawalsIsActiveQuery';

const WithdrawTab = () => {
	const { transferableCollateral } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const depositsDataQuery = useGetWithdrawalsDataQuery();
	const withdrawalsInactive = !useGetWithdrawalsIsActiveQuery().data;

	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [depositTxError, setDepositTxError] = useState<string | null>(null);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [amountToWithdraw, setAmountToWithdraw] = useState<BigNumber>(toBigNumber(0));

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && walletAddress && !amountToWithdraw.isZero() && !amountToWithdraw.isNaN()) {
				try {
					setGasEstimateError(null);
					const {
						contracts: { SynthetixBridgeToBase },
						utils: { parseEther },
					} = synthetix.js!;
					const gasEstimate = await synthetix.getGasEstimateForTransaction({
						txArgs: [parseEther(amountToWithdraw.toString())],
						method: SynthetixBridgeToBase.estimateGas.withdraw,
					});
					setGasLimitEstimate(gasEstimate);
				} catch (e) {
					console.log(e);
					setGasEstimateError(e.message);
				}
			}
		};
		getGasLimitEstimate();
	}, [walletAddress, isAppReady, amountToWithdraw, transferableCollateral]);

	const handleDeposit = async () => {
		if (isAppReady && !gasEstimateError) {
			const {
				contracts: { SynthetixBridgeToBase },
				utils: { parseEther },
			} = synthetix.js!;
			try {
				setDepositTxError(null);
				setTxModalOpen(true);
				const transaction = await SynthetixBridgeToBase.withdraw(
					parseEther(amountToWithdraw.toString()),
					{ gasLimit: gasLimitEstimate, gasPrice: normalizedGasPrice(gasPrice) }
				);

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
			<TabContent
				inputValue={amountToWithdraw}
				onInputChange={(value: number) => setAmountToWithdraw(toBigNumber(value.toString()))}
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
				bridgeInactive={withdrawalsInactive}
			/>
		</StyledTabContainer>
	);
};

const StyledTabContainer = styled(TabContainer)`
	padding: 0;
`;

export default WithdrawTab;
