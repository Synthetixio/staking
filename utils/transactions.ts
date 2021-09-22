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

/**
 * Perform a contract transaction.
 * Dry re-run on failure to obtain revert reason and call `options.showErrorNotification?`.
 *
 * @param  {Function} makeTx
 * @param  {TxOptions} options?
 * @returns Promise
 */
export async function tx(makeTx: Function, options?: TxOptions): Promise<void> {
	const [contract, method, args, ...txnOptions] = makeTx();

	const fullArgs = args;

	if (txnOptions) {
		fullArgs.push(...txnOptions);
	}

	let hash, wait;
	try {
		({ hash, wait } = await contract[method](...fullArgs));
	} catch (e) {
		try {
			await contract.callStatic[method](...fullArgs);
			throw e;
		} catch (e) {
			const errorMessage = e.data ? hexToASCII(e.data.substr(147).toString()) : e.message;
			console.log(errorMessage);
			options?.showErrorNotification?.(errorMessage);
			throw e;
		}
	}

	options?.showProgressNotification?.(hash);

	try {
		await wait();
		options?.showSuccessNotification?.(hash);
	} catch (e) {
		console.log(e);
		options?.showErrorNotification?.(e);
		throw e;
	}
}

export function hexToASCII(hex: string): string {
	// https://gist.github.com/gluk64/fdea559472d957f1138ed93bcbc6f78a#file-reason-js
	// return ethers.utils.toUtf8String(S.split(' ')[1].toString());
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}

export const fromBytes32 = hexToASCII;
