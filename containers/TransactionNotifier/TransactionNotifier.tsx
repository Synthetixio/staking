import { createContainer } from 'unstated-next';
import { toast } from 'react-toastify';
import { TransactionStatusData, TransactionFailureData } from '@synthetixio/transaction-notifier';

import Connector from 'containers/Connector';
import Etherscan from 'containers/BlockExplorer';

import {
	NotificationSuccess,
	NotificationPending,
	NotificationError,
} from 'components/Notification';

const useTransactionNotifier = () => {
	const { transactionNotifier } = Connector.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();

	const monitorTransaction = ({
		txHash,
		onTxConfirmed,
		onTxFailed,
	}: {
		txHash: string;
		onTxConfirmed?: () => void;
		onTxFailed?: (failureMessage: TransactionFailureData) => void;
	}) => {
		const link = blockExplorerInstance != null ? blockExplorerInstance.txLink(txHash) : undefined;
		if (transactionNotifier) {
			const toastProps = {
				onClick: () => window.open(link, '_blank'),
			};
			const emitter = transactionNotifier.hash(txHash);
			emitter.on('txSent', () => {
				toast(NotificationPending, { ...toastProps, toastId: txHash });
			});
			emitter.on('txConfirmed', ({ transactionHash }: TransactionStatusData) => {
				toast.update(transactionHash, {
					...toastProps,
					render: NotificationSuccess,
					// autoClose: 10000,
				});
				if (onTxConfirmed != null) {
					onTxConfirmed();
				}
			});
			emitter.on('txFailed', ({ transactionHash, failureReason }: TransactionFailureData) => {
				toast.update(transactionHash, {
					...toastProps,
					render: <NotificationError failureReason={failureReason} />,
				});
				if (onTxFailed != null) {
					onTxFailed(failureReason);
				}
			});
		}
	};
	return { monitorTransaction };
};

const TransactionNotifier = createContainer(useTransactionNotifier);

export default TransactionNotifier;
