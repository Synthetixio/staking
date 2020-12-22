import { normalizeGasLimit } from './network';

export const getGasEstimateForTransaction = async (txArgs: any[], method: Function) => {
	try {
		const gasEstimate = await method(...txArgs);
		return normalizeGasLimit(Number(gasEstimate));
	} catch (error) {
		throw error;
	}
};
