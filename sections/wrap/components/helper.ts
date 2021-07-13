import BigNumber from 'bignumber.js';
import { NumericValue, toBigNumber, zeroBN, maxBN } from 'utils/formatters/number';

export function getMintAmount(
	targetCRatio: BigNumber,
	stakeAmount: NumericValue,
	SNXPrice: BigNumber
): BigNumber {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return toBigNumber(0);
	return toBigNumber(stakeAmount).multipliedBy(targetCRatio).multipliedBy(SNXPrice);
}

export function getStakingAmount(
	targetCRatio: BigNumber,
	mintAmount: NumericValue,
	SNXPrice: BigNumber
): BigNumber {
	if (!mintAmount || !targetCRatio || !SNXPrice) return toBigNumber(0);
	return toBigNumber(mintAmount).dividedBy(targetCRatio).dividedBy(SNXPrice);
}

export function getTransferableAmountFromMint(
	balance: BigNumber,
	stakedValue: BigNumber
): BigNumber {
	if (!balance || !stakedValue) return toBigNumber(0);
	return maxBN(balance.minus(stakedValue), zeroBN);
}

export function getTransferableAmountFromBurn(
	amountToBurn: NumericValue,
	debtEscrowBalance: BigNumber,
	targetCRatio: BigNumber,
	SNXPrice: BigNumber,
	transferable: BigNumber
): BigNumber {
	if (!amountToBurn) return toBigNumber(0);
	return transferable.plus(
		maxBN(
			toBigNumber(amountToBurn)
				.minus(debtEscrowBalance)
				.dividedBy(targetCRatio)
				.dividedBy(SNXPrice),
			zeroBN
		)
	);
}

export function sanitiseValue(value: BigNumber) {
	if (value.isNegative() || value.isNaN() || !value.isFinite()) {
		return zeroBN;
	} else {
		return value;
	}
}
