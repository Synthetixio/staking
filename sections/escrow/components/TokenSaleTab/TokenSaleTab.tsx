import React, { useState, useEffect, useCallback } from 'react';
import Notify from 'containers/Notify';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { useRecoilValue } from 'recoil';
import { isWalletConnectedState } from 'store/wallet';
import { appReadyState } from 'store/app';

import TabContent from './TabContent';
import { TabContainer } from '../common';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { Transaction } from 'constants/network';

import useTokenSaleEscrowQuery from 'queries/escrow/useTokenSaleEscrowQuery';

const TokenSaleTab: React.FC = () => {
	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);

	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasEstimateError, setGasEstimateError] = useState<string | null>(null);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [vestTxError, setVestTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const tokenSaleData = tokenSaleEscrowQuery?.data;
	const canVestAmount = tokenSaleData?.claimableAmount ?? 0;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				try {
					setGasEstimateError(null);
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						synthetix.js!.contracts.SynthetixEscrow.estimateGas.vest
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
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
						monitorHash({
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
	}, [isAppReady, gasPrice, gasLimitEstimate, tokenSaleEscrowQuery, monitorHash]);

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
