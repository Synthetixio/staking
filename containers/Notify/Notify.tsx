import { TransactionData } from 'bnc-notify';

import Connector from 'containers/Connector';
import Etherscan from 'containers/Etherscan';
import { createContainer } from 'unstated-next';

export interface TransactionFailed extends TransactionData {
	failureReason: string;
}

const useNotify = () => {
	const { notify } = Connector.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();

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

			const link = etherscanInstance != null ? etherscanInstance.txLink(txHash) : undefined;

			emitter.on('txConfirmed', (txData) => {
				console.log(txData);
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
