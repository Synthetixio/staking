import { normalizeGasLimit } from './network';

export const getGasEstimateForTransaction = async (txArgs: any[], method: Function) => {
	try {
		const gasEstimate = await method(...txArgs);
		return normalizeGasLimit(Number(gasEstimate));
	} catch (error) {
		throw error;
	}
};

type TxOptions = {
	showErrorNotification?: Function;
	showProgressNotification?: Function;
	showSuccessNotification?: Function;
};

export async function tx(makeTx: Function, options?: TxOptions): Promise<void> {
	const [contract, method, args] = makeTx();
	let hash, wait;
	try {
		({ hash, wait } = await contract[method](...args));
	} catch (e) {
		try {
			await contract.callStatic[method](...args);
			throw e;
		} catch (e) {
			options?.showErrorNotification?.(e.data ? hexToASCII(e.data) : e);
			throw e;
		}
	}

	options?.showProgressNotification?.(hash);

	try {
		await wait();
		options?.showSuccessNotification?.(hash);
	} catch (e) {
		options?.showErrorNotification?.(e);
		throw e;
	}
}

function hexToASCII(S: string): string {
	// https://gist.github.com/gluk64/fdea559472d957f1138ed93bcbc6f78a#file-reason-js
	// return ethers.utils.toUtf8String(S.split(' ')[1].toString());
	const hex = S.substr(147).toString();
	let str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}
