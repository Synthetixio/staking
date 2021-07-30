import React, { useState, useEffect, useCallback } from 'react';
import TransactionNotifier from 'containers/TransactionNotifier';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';

import TabContent from './TabContent';
import { TabContainer } from '../common';
import { normalizedGasPrice } from 'utils/network';
import { Transaction, GasLimitEstimate } from 'constants/network';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

const TokenSaleTab: React.FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	const { useTokenSaleEscrowQuery } = useSynthetixQueries();

	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery(walletAddress);
	const isAppReady = useRecoilValue(appReadyState);

	const { monitorTransaction } = TransactionNotifier.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [vestTxError, setVestTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const tokenSaleData = tokenSaleEscrowQuery?.data;
	const canVestAmount = tokenSaleData?.claimableAmount ?? wei(0);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				try {
					setGasEstimateError(null);
					const gasEstimate = await synthetix.getGasEstimateForTransaction({
						txArgs: [],
						method: synthetix.js!.contracts.SynthetixEscrow.estimateGas.vest,
					});
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setGasEstimateError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [gasEstimateError, isWalletConnected, isAppReady]);

	const handleVest = useCallback(() => {
		async function vest() {
			if (isAppReady) {
				try {
					setVestTxError(null);
					setTxModalOpen(true);
					const {
						contracts: { SynthetixEscrow },
					} = synthetix.js!;

					let transaction: ethers.ContractTransaction = await SynthetixEscrow.vest({
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit: gasLimitEstimate,
					});

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
								tokenSaleEscrowQuery.refetch();
							},
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setVestTxError(e.message);
				}
			}
		}
		vest();
	}, [isAppReady, gasPrice, gasLimitEstimate, tokenSaleEscrowQuery, monitorTransaction]);

	return (
		<TabContainer>
			<TabContent
				claimableAmount={canVestAmount}
				onSubmit={handleVest}
				transactionError={vestTxError}
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

export default TokenSaleTab;
