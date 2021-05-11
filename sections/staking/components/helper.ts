import BN from 'bn.js';
import { NumericValue, toBigNumber, zeroBN, maxBN } from 'utils/formatters/number';

export function getMintAmount(targetCRatio: BN, stakeAmount: NumericValue, SNXPrice: BN): BN {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return toBigNumber(0);
	return toBigNumber(stakeAmount).mul(targetCRatio).mul(SNXPrice);
}

export function getStakingAmount(targetCRatio: BN, mintAmount: NumericValue, SNXPrice: BN): BN {
	if (!mintAmount || !targetCRatio || !SNXPrice) return toBigNumber(0);
	return toBigNumber(mintAmount).div(targetCRatio).div(SNXPrice);
}

export function getTransferableAmountFromMint(balance: BN, stakedValue: BN): BN {
	if (!balance || !stakedValue) return toBigNumber(0);
	return maxBN(balance.sub(stakedValue), zeroBN);
}

export function getTransferableAmountFromBurn(
	amountToBurn: NumericValue,
	debtEscrowBalance: BN,
	targetCRatio: BN,
	SNXPrice: BN,
	transferable: BN
): BN {
	if (!amountToBurn) return toBigNumber(0);
	return transferable.add(
		maxBN(toBigNumber(amountToBurn).sub(debtEscrowBalance).div(targetCRatio).div(SNXPrice), zeroBN)
	);
}

export function sanitiseValue(value: BN) {
	if (value.lt(zeroBN) || Number.isNaN(value.toNumber()) || !Number.isFinite(value.toNumber())) {
		return zeroBN;
	} else {
		return value;
	}
}
