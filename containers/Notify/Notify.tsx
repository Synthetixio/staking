import { TransactionData } from 'bnc-notify';

import Connector from 'containers/Connector';
import Etherscan from 'containers/BlockExplorer';
import { createContainer } from 'unstated-next';

export interface TransactionFailed extends TransactionData {
	failureReason: string;
}

const useNotify = () => {
	const { notify } = Connector.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();

	// TODO: perhaps, find a better name?
	const monitorHash = ({
		txHash,
		onTxConfirmed,
		onTxFailed,
	}: {
		txHash: string;
		onTxConfirmed?: (txData: TransactionData) => void;
		onTxFailed?: (txData: TransactionFailed) => void;
	}) => {
		if (notify) {
			const { emitter } = notify.hash(txHash);

			const link = blockExplorerInstance != null ? blockExplorerInstance.txLink(txHash) : undefined;

			emitter.on('txConfirmed', (txData) => {
				if (onTxConfirmed != null) {
					onTxConfirmed(txData);
				}
				return {
					autoDismiss: 0,
					link,
				};
			});
			emitter.on('txFailed', (txData) => {
				if (onTxFailed != null) {
					onTxFailed(txData as TransactionFailed);
				}
				return {
					link,
				};
			});

			emitter.on('all', () => {
				return {
					link,
				};
			});
		}
	};
	return {
		monitorHash,
	};
};

const Notify = createContainer(useNotify);

export default Notify;
